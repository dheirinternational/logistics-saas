import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET(req: Request){
    try{
        const session = await getSession()
    
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const { user_id } = session

        const res = await pool.query(`
            SELECT 
              p.*,
              s.channel as shipment_channel,
              s.total_weight as shipment_weight,
              s.total_weight_unit as shipment_weight_unit,
              s.shipment_note as shipment_note,
              s.package_ids as shipment_package_ids,
              w_origin.name as origin_warehouse_name,
              w_dest.name as destination_warehouse_name
            FROM payments p
            LEFT JOIN shipments s ON p.shipment_tracking_number = s.tracking_number
            LEFT JOIN warehouses w_origin ON s.origin_warehouse_id = w_origin.id
            LEFT JOIN warehouses w_dest ON s.destination_warehouse_id = w_dest.id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
        `, [user_id])   
        
        return NextResponse.json({
            success: true,
            data: res.rows
        })  
    }
    catch(err){
        console.error("Error Fetching Payments", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}