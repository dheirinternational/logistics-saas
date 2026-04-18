import { pool } from "@/lib/db/db";
import { getHost } from "@/lib/db/getHost";
import { getSession } from "@/lib/db/session";
import { generateOrderTrackingNumber } from "@/lib/generators/generateTrackingNumber";
import { CartProduct } from "@/types/entityTypeDef";
import { NextRequest, NextResponse } from "next/server";



export async function POST (req: NextRequest){

    const origin = getHost(req)
    const client = await pool.connect()
    
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({ 
                message: "Unauthorized"
            })
        }

        const { email, amount, metadata, delivery_fee = 0, extra_charges = 0, destination_address, customer_code="KRC0013", cart_items} = await req.json();

        const user_id = session.user_id
        const order_id = generateOrderTrackingNumber()

        await client.query("BEGIN");

        const productIds = cart_items.map((item: CartProduct) => item.id);
        
        const productsRes = await client.query(
            `
            SELECT id, stock_quantity, name
            FROM products
            WHERE id = ANY($1)
            FOR UPDATE
            `,
            [productIds]
        );

        const productMap = new Map(
          productsRes.rows.map((p) => [p.id, p])
        );
        
        for (const item of cart_items) {
            const product = productMap.get(item.id);

            if (!product) {
                throw new Error("Product not found");
            }

            if (item.amount_to_be_ordered > product.stock_quantity) {
                throw new Error(`${product.name} is out of stock`);
            }
        }


        await client.query(
            `
            INSERT INTO orders (
                order_id,
                user_id,
                total_price,
                delivery_fee,
                extra_charges,
                payment_status,
                status,
                destination_address,
                customer_code
            )
            VALUES ($1, $2, $3, $4, $5, 'pending', 'Confirmed', $6, $7)
            `,
        [order_id, user_id, amount, delivery_fee, extra_charges, destination_address, customer_code]
        );


        for (const item of cart_items) {

            const price =
            item.discount_price && item.discount_price !== 0
            ? item.discount_price
            : item.price;

            await client.query(
                `
                INSERT INTO order_items (
                    order_id, product_id, quantity, unit_price, product_image, product_name
                )
                VALUES ($1,$2,$3,$4,$5,$6)
                `,
                [ order_id, item.id, Number(item.amount_to_be_ordered), price, item.image, item.name]
            );
        }

        await client.query("COMMIT")

        const res = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                amount: amount * 100,
                reference: order_id,
                callback_url: `${origin}/base/verify_order_payment`,
                metadata: {
                    ...metadata,
                    order_id,
                }
            })
        })

        const result = await res.json()

        if(!res.ok){

            await pool.query(
                `
                UPDATE orders
                SET payment_status = 'failed',
                    updated_at = NOW()
                WHERE order_id = $1
                `,
                [order_id]
            );

            
            console.error("Error Initializing Payment", result)
        
            return NextResponse.json({
                message: "Error Initializing Payment",
                data: result
            }, {status: 500})       
        }     

        // SAVE PAYSTACK REFERENCE
        await pool.query(
        `
        UPDATE orders
        SET paystack_reference = $1,
            updated_at = NOW()
        WHERE order_id = $2
        `,
        [result.data.reference, order_id]
        );

        // console.log("Payment Initialization Result", result)

        return NextResponse.json({
            message: "Payment Initialized",
            data: result,
            order_id
        })      
    } catch(err) {
        console.error("Internal Server Error", err)
        await client.query("ROLLBACK");
        return NextResponse.json({
            message: "Internal Server Error",
        }, {status: 500})
    } finally {
        client.release();
    }
}