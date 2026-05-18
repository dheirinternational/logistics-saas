import ProductCard from "@/components/base/marketplace/ProductCard";
import { pool } from "@/lib/db/db";
import { verifyMonnifySignature } from "@/lib/monnify/signature";
import { NextResponse, NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {

    const client = await pool.connect()

    try{

        const rawBody = await req.text()
        
        console.log(rawBody)

        const signature = req.headers.get("monnify-signature") || ""
        const isValid = verifyMonnifySignature(rawBody, signature)

        if (!isValid) {
            return NextResponse.json({
                success: false,
                message: "Invalid Signature"
            }, { status: 401 })
        }

        const body = JSON.parse(rawBody) 
        console.log("Webhook Received:", body)

        const paymentStatus = body.eventData.paymentStatus;
        const reference = body.eventData.product.reference

        if (paymentStatus === "PAID") {
            switch(body.eventData.paymentDescription){
                case "shipment" : 
                    await client.query("BEGIN");

                    // 1. GET PAYMENT
                    const paymentRes = await client.query(
                        `
                        SELECT *
                        FROM payments
                        WHERE transaction_ref = $1
                        FOR UPDATE
                        `,
                        [reference]
                    );

                    if (paymentRes.rowCount === 0) {
                        await client.query("ROLLBACK");
                        return NextResponse.json(
                        { message: "Payment not found" },
                        { status: 404 }
                        );
                    }

                    const payment = paymentRes.rows[0];

                    // 2. PREVENT DOUBLE PROCESSING
                    if (payment.status === "paid") {
                        await client.query("ROLLBACK");
                        return NextResponse.json({ message: "Already processed" });
                    }

                    // 3. UPDATE PAYMENT TABLE
                    await client.query(
                        `
                        UPDATE payments
                        SET status = 'paid',
                            paid_at = NOW()
                        WHERE transaction_ref = $1
                        `,
                        [reference]
                    );

                    // 4. UPDATE SHIPMENT
                    await client.query(
                        `
                        UPDATE shipments
                        SET paid_for = true,
                            status = 'processing', -- or "ready_for_shipping"
                            payment_time = NOW()::text
                        WHERE tracking_number = $1
                        `,
                        [payment.shipment_tracking_number]
                    );

                    // 5. COMMIT
                    await client.query("COMMIT");

                    console.log("SHIPMENT PAYMENT COMPLETED:", reference);

                    return NextResponse.json({ status: "ok" });

                case "order" :
                    await client.query("BEGIN");

                    const orderRes = await client.query(
                        `
                        SELECT order_id, payment_status
                        FROM orders
                        WHERE paystack_reference = $1
                        FOR UPDATE
                        `,
                        [reference]
                    );

                    if (orderRes.rowCount === 0) {
                        await client.query("ROLLBACK");
                        return NextResponse.json(
                        { message: "Order not found" },
                        { status: 404 }
                        );
                    }

                    const order = orderRes.rows[0]
                    
                    if (order.payment_status === "paid") {
                        await client.query("ROLLBACK");
                        return NextResponse.json({ message: "Already processed" });
                    }

                    const itemsRes = await client.query(
                        `
                        SELECT product_id, quantity
                        FROM order_items
                        WHERE order_id = $1
                        `,
                        [order.order_id]
                    );

                    const productIds = itemsRes.rows.map((i) => i.product_id);

                    const productsRes = await client.query(
                        `
                        SELECT id, stock_quantity
                        FROM products
                        WHERE id = ANY($1)
                        FOR UPDATE
                        `,
                        [productIds]
                    );

                    const productMap = new Map(
                        productsRes.rows.map((p) => [Number(p.id), p])
                    );

                    console.log(productMap)

                    for (const item of itemsRes.rows) {
                        const product = productMap.get(Number(item.product_id))
                        console.log(productMap.get(7))
                        console.log(product)
                        console.log(item.quantity, product.stock_quantity);

                        if (!product || Number(product.stock_quantity) < Number(item.quantity)) {
                        throw new Error("Stock inconsistency detected");
                        }

                        await client.query(
                        `
                        UPDATE products
                        SET stock_quantity = stock_quantity - $1
                        WHERE id = $2
                        `,
                        [item.quantity, item.product_id]
                        );
                    }

                    await client.query(
                        `
                        UPDATE orders
                        SET payment_status = 'paid',
                            paid_at = NOW(),
                            updated_at = NOW()
                        WHERE order_id = $1
                        `,
                        [order.order_id]
                    );
                    
                    await client.query("COMMIT");

                    console.log("ORDER PAID + STOCK UPDATED:", reference);

                    return NextResponse.json({ status: "ok" });
            }
            
        }

        return NextResponse.json({
            received: true
        })
    }
    catch(err){
        console.error(err)
        return NextResponse.json({
            success: false
        }, { status: 500 })
    } finally {
        client.release();
    }
}