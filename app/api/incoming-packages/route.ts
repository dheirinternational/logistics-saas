import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    try{
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json()

        console.log(body)

        if(body.declared_quantity < 1){
            return NextResponse.json({
                error: "Item Quantity cannot be less than 1"
            }, {status: 400})
        }

        const weight = body.declared_item_weight === 0 ? null : body.declared_item_weight
        const customer_note = body?.customer_note?.trim() || null

        const codeRes = await pool.query(`
            SELECT code FROM customers
            WHERE user_id = $1  
        `, [session.user_id])

        const customer_code = codeRes.rows[0].code


        const res = await pool.query(`
            INSERT INTO incoming_packages(user_id, customer_code, incoming_tracking_number, warehouse_id, status, declared_item_name, declared_item_quantity, declared_item_weight, created_at, customer_note)    
            VALUES ($1, $2, $3, $4, 'expected', $5, $6, $7, NOW(), $8)
            RETURNING *
        `, [session.user_id, customer_code, body.incoming_tracking_number, body.warehouse_id, body.declared_item_name, body.declared_item_quantity, weight, customer_note])

        const result = res.rows[0]

        return NextResponse.json({
            success: true,
            data: result
        }, {status: 200})
    }
    catch(err){
        console.error("SERVER ERROR", err)
        return NextResponse.json({
            error: "Failed to put in package"
        }, {status: 500})
    }
}