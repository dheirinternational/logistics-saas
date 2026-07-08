import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET(){
    try{
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const res = await pool.query(`
            SELECT 
              s.*,
              w_origin.name as origin_warehouse_name,
              w_dest.name as destination_warehouse_name
            FROM shipments s
            LEFT JOIN warehouses w_origin ON s.origin_warehouse_id = w_origin.id
            LEFT JOIN warehouses w_dest ON s.destination_warehouse_id = w_dest.id
            WHERE s.user_id = $1
            ORDER BY s.created_at DESC
        `, [session.user_id])

        const shipmentIds = res.rows.map(r => Number(r.id))
        const imagesMap: Record<number, { imageUrl: string; mediaType: string }[]> = {}
        
        if (shipmentIds.length > 0) {
            const imagesRes = await pool.query(
                `SELECT shipment_id, image_url, media_type 
                 FROM shipment_images 
                 WHERE shipment_id = ANY($1)`,
                [shipmentIds]
            )
            for (const r of imagesRes.rows) {
                const sid = Number(r.shipment_id)
                if (!imagesMap[sid]) {
                    imagesMap[sid] = []
                }
                imagesMap[sid].push({
                    imageUrl: r.image_url,
                    mediaType: r.media_type || "photo"
                })
            }
        }

        const data = res.rows.map(row => ({
            ...row,
            images: imagesMap[Number(row.id)] ?? []
        }))

        return NextResponse.json({
            success: true,
            data
        })

    }

    catch(err){
        console.error("Error Fetching User Shipments", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}