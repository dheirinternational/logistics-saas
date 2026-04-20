import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export async function GET(){
    try{

        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            })
        }

        if(session.role !== "admin"){
            return NextResponse.json({
                message: "Forbidden",
                success: false
            })
        }

        const shipmentRes = await pool.query(`
            SELECT COUNT(*) FROM shipments
            WHERE status != 'delivered'
        `)

        const ProRes = await pool.query(`
            SELECT COUNT(*) FROM shipments
            WHERE status = 'processing'
        `) 

        const shippedRes = await pool.query(`
            SELECT COUNT(*) FROM shipments
            WHERE status = 'shipped'
        `) 
        
        const transitRes = await pool.query(`
            SELECT COUNT(*) FROM shipments
            WHERE status = 'in_transit'
        `) 

        const deliveredRes = await pool.query(`
            SELECT COUNT(*) FROM shipments
            WHERE status = 'delivered'
        `) 

        
        console.log({
            total_active_count: Number(shipmentRes.rows[0].count),
            processing: Number(ProRes.rows[0].count),
            shipped: Number(shippedRes.rows[0].count),
            in_transit: Number(transitRes.rows[0].count),
            delivered: Number(deliveredRes.rows[0].count)
        })


        return NextResponse.json({
            success: true,
            message: "Active Shipment Count successfully retrieved",
            data: {
                total_active_count: Number(shipmentRes.rows[0].count),
                processing: Number(ProRes.rows[0].count),
                shipped: Number(shippedRes.rows[0].count),
                in_transit: Number(transitRes.rows[0].count),
                delivered: Number(deliveredRes.rows[0].count)
            }
        })


    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        })
    }
}