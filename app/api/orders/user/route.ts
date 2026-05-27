import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export async function GET(){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const result = await pool.query(`
            SELECT
              o.*,
              ms.status AS latest_manual_payment_status,
              ms.admin_note AS latest_manual_payment_admin_note
            FROM orders o
            LEFT JOIN LATERAL (
              SELECT status, admin_note
              FROM manual_payment_submissions
              WHERE payment_type = 'order'
                AND reference = o.order_id
              ORDER BY created_at DESC
              LIMIT 1
            ) ms ON true
            WHERE o.user_id = $1
        `, [session.user_id])

        return NextResponse.json({
            success: true,
            message: "Orders Successfully Retrieved",
            data: result.rows
        })
    }
    catch(err){
        console.error("Error Retrieving Shipments Requests", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}