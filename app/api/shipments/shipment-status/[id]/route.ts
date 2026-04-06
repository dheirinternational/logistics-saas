import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}){
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

        const body = await req.json()
        const {id} = await params

        await pool.query(`
            UPDATE shipments
                SET status = $1
                WHERE id = $2
        `, [body.status, id])

        return NextResponse.json({
            success: true,
            message: "Status successfully updated"
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