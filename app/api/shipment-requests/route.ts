import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const body = await req.json()

        const {customer_code, package_ids, channel, wrapping, payment_time} = body

        const {user_id} = session

        const res = await pool.query(`
            INSERT INTO shipment_requests (
                user_id,
                customer_code,
                package_ids,
                channel,
                payment_time
            )
            VALUES (
                $1, $2, $3, $4, $5
            )
            RETURNING *     
        `, [user_id,customer_code, package_ids, channel, payment_time])

        await pool.query(`
            UPDATE packages
                SET status = 'requested_for'
                WHERE id = ANY($1)  
        `, [package_ids])

        return NextResponse.json({
            success: true,
            message: res.rows[0]    
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
            SELECT * FROM shipment_requests
        `)

        return NextResponse.json({
            success: true,
            data: res.rows
        })

    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, {status: 500})
    }
}