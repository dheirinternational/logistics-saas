import { pool } from "@/lib/db/db"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
    try{

        const { weight, number_of_items, shipping_method, wrapping_type="standard", payment_time="pay_before_shipment" } = await req.json()

        if (typeof weight !== "number" || weight < 0 || typeof number_of_items !== "number" || number_of_items < 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid input: Weight and number of items must be non-negative numbers."
            }, { status: 400 })
        }

        const shipRes = await pool.query(`
            SELECT price FROM shipping_methods
            WHERE name = $1 
        `, [shipping_method])

        if (shipRes.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid shipping method."
            }, { status: 400 })
        }

        const wrapRes = await pool.query(`
            SELECT price FROM wrapping_methods
            WHERE name = $1 
        `, [wrapping_type])

        if (wrapRes.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid wrapping type."
            }, { status: 400 })
        }

        const itemPriceRes = await pool.query(`
            SELECT price_per_unit, price_per_kg, rate_unit
            FROM item_pricing_methods
            WHERE name = 'standard' 
            LIMIT 1
        `)

        if (itemPriceRes.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid payment time."
            }, { status: 400 })
        }

        const otherPriceRes = await pool.query(`
            SELECT price FROM pricing
            WHERE name = 'other_fees'
        `)

        const payTimeRes = await pool.query(`
            SELECT price FROM pricing
            WHERE name = $1
        `, [payment_time])


        console.log({
            shipping_fee: Number(shipRes.rows[0].price),
            wrapping_fee: Number(wrapRes.rows[0].price),
            item_fee: Number(
                (Number(itemPriceRes.rows[0]?.price_per_unit ?? itemPriceRes.rows[0]?.price_per_kg ?? 0) *
                (weight * number_of_items))
            ),
            other_fee: Number(otherPriceRes.rows[0].price),
            payment_time_fee: Number(payTimeRes.rows[0].price)
        })

       const shipping = Number(shipRes.rows[0]?.price || 0)
        const wrapping = Number(wrapRes.rows[0]?.price || 0)
        const other = Number(otherPriceRes.rows[0]?.price || 0)
        const payTime = Number(payTimeRes.rows[0]?.price || 0)

        const itemCost =
            Number(itemPriceRes.rows[0]?.price_per_unit ?? itemPriceRes.rows[0]?.price_per_kg ?? 0) *
            (Number(weight) * Number(number_of_items))

        const total_fee = Number(
            (shipping + wrapping + itemCost + other + payTime).toFixed(2)
        )
        
        console.log("Total ee", total_fee)


        return NextResponse.json({ 
            success: true,
            message: "Fee successfully calculated",
            data: total_fee
        })

    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, {status: 500})   
    }   

}