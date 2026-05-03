import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(req: NextRequest){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        if(session.role !== "admin"){
            return NextResponse.json({
                success: false,
                message: "Forbidden"
            }, {status: 403})
        }

        const {status, id} = await req.json()

        await pool.query(`
            UPDATE shipments
                SET 
                    status = $1
                WHERE 
                    id = $2
        `, [status, Number(id)])

        return NextResponse.json({
            success: false,
            message: `Shipment status successfully updated`
        })
    }
    catch(err){
        console.error("Internal Server Error, could not update shipment status", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, could not update shipment status" 
        }, {status: 500})
    }
}