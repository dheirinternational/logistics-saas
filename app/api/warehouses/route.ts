import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";

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
            SELECT * FROM warehouses        
        `)

        return NextResponse.json({
            success: true,
            message: "Successfully fetched warehouses",
            data: res.rows
        }, {status: 200})

    }
    catch(err){
        console.error("Internal Server Error, could not fetch warehouses", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, could not fetch warehouses"
        }, {status: 500})
    }
    
}



export async function POST(request: Request){
    try{

        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (session.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await request.json()

        if(body.country === "CN"){
            if(!body.province.trim() || !body.district.trim()){
                return NextResponse.json({
                    error: "Province and District field compulsory for china warehouses"
                }, {status: 400})
            }
        }

        const res = await pool.query(`
          INSERT INTO warehouses (name, recipient_name, phone, country, province, city, district, street, building, postal_code, type, manager_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `, [body.name, body.recipient_name, body.phone, body.country, body.province, body.city, body.district, body.street, body.building, body.postal_code, body.type, body.manager_id])

        return NextResponse.json({
            success: true,
            data: res.rows[0]
        }, {status: 201})
    }
    catch(err){
        console.error("Internal server Error, could not add warehouse", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, {status: 500})
    }
}