import { NextResponse } from "next/server";
import { getSession } from "@/lib/db/session";
import { pool } from "@/lib/db/db";

export async function GET(){
    try{
        const session = await getSession()

        if (!session) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            })
        }

        const res = await pool.query(`
            SELECT id, email, first_name, last_name, phone, role, created_at FROM users
            WHERE id = $1
            LIMIT 1    
        `, [session.user_id])

        if (res.rows.length === 0){
            return NextResponse.json({
                success: false,
                message: "Error! Data does not exist"
            }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            data: res.rows[0]            
        }, {status: 201})
    }
    catch(err){
        console.error("ERROR FETCHING USER DATA", err)
        return NextResponse.json({
            success: false,
            message: "Error fetching user Data"
        })
    }
}


export async function PUT(request: Request){
    
    try{
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        } 

        const body = await request.json()

        if(String(body.first_name).length < 2 || String(body.last_name).length < 2){
            return NextResponse.json({
                success: false,
                message: "Characters cannot be less than 2"
            }, {status: 400})
        } 
        

        const updatedData = await pool.query(`
            UPDATE users
            SET first_name = $1, last_name = $2, phone = $3
            WHERE id = $4
            RETURNING *
        `, [body.first_name, body.last_name, body.phone, session.user_id])

        return NextResponse.json({
            success: true,
            data: updatedData.rows[0]
        }, {status: 200})
    }
    catch(err){
        console.error("SERVER ERROR", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}