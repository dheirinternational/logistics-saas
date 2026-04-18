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
            SELECT * FROM orders
            WHERE user_id = $1 
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