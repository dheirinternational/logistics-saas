import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, {params} : {params: Promise<{id: string}>}){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        if(session.role !== "admin"){
            return NextResponse.json({
                success: false,
                messgae: "Forbidden"
            }, {status: 403})
        }

        const {id} = await params 

        const res = await pool.query(`
            SELECT * FROM shipment_requests
                WHERE id = $1 
        `, [id])

        return NextResponse.json({
            success: true,
            data: res.rows[0]
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