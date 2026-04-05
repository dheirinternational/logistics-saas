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

        const res = await pool.query(`
            SELECT * FROM shipment_requests
                WHERE user_id = $1
        `, [session.user_id])

        return NextResponse.json({
            success: true,
            data: res.rows
        })

    }
    catch(err){
        console.error("Error Creating Shipment Requests", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}