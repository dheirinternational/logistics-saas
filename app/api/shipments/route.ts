import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { generateTrackingNumber } from "@/lib/generators/generateTrackingNumber";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest){
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
        const {customer_code, origin_warehouse_id, destination_warehouse_id, channel, total_cost, shipment_request_id, shipment_note} = body

        const tracking_number = generateTrackingNumber()

        const res = await pool.query(`
            INSERT INTO shipments
            (tracking_number, customer_code, origin_warehouse_id, destination_warehouse_id, channel, total_cost, shipment_note, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [tracking_number, customer_code, origin_warehouse_id, destination_warehouse_id, channel, total_cost, shipment_note])

        await pool.query(`
            UPDATE shipment_requests
                SET status = 'accepted'
                WHERE id = $1
        `, [shipment_request_id])

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


export async function GET(){
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

        const res = await pool.query(`
            SELECT * FROM shipments
        `)

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