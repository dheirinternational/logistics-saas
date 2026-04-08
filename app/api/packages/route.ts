import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
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

        const { role } = session

        if (role !== "admin"){
            return NextResponse.json({
                success: false, 
                message: "FORBIDDEN!"
            }, {status: 403})
        }

        const body = await req.json()

        const {incoming_package_id, package_name, user_id, customer_code, warehouse_id, weight, condition, status, received_at, stored_at, inp_status} = body

        if(inp_status === "stored"){
            return NextResponse.json({
                success: false,
                message: "Record already exists in database"
            }, {status: 409})
        }

        const res = await pool.query(`
            INSERT INTO packages(
                incoming_package_id, package_name, user_id, customer_code, warehouse_id, weight, condition, status, received_at, stored_at, created_at 
            )     
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        `, [incoming_package_id, package_name, user_id, customer_code, warehouse_id, weight, condition, status, received_at, stored_at ])

        await pool.query(`
            UPDATE incoming_packages
                SET status = 'stored'
                WHERE incoming_tracking_number = $1
        `, [incoming_package_id])

        return NextResponse.json({
            success: false,
            data: res.rows
        })
        
    }
    catch(err){
        console.error("Error Adding Products", err)
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

        const res = await pool.query(`
            SELECT * FROM packages    
        `)

        return NextResponse.json({
            success: true,
            data: res.rows
        })

    }
    catch(err){
        console.error("Error fetching Packages", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})

    }
}