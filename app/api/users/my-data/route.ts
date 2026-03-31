import { NextResponse } from "next/server";
import { getSession } from "@/lib/db/session";
import { pool } from "@/lib/db/db";

export async function GET() {
    try{
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                error: "No Session"
            }, {status: 401})
        }

        const user = await pool.query(`
            SELECT id, email, first_name, last_name, phone, role, created_at FROM users
            WHERE id = $1
            LIMIT 1
        `, [session.user_id])

        if(user.rows.length === 0){
            return NextResponse.json({
                error: "Account Details not Found"
            }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            user: user.rows[0]
        }, {status: 200})

    }
    catch(err){
        console.error("MY_DATA_ERROR", err)
        return NextResponse.json({
            error: "Something went wrong"
        }, {status: 500})
    }
}


export async function PUT(request: Request){
    try{

        const session = await getSession()

        if(!session){
            return NextResponse.json({
                error: "No Session"
            }, {status: 401})
        } 

        const body = await request.json()

        if(String(body.first_name).length < 2 || String(body.last_name).length < 2){
            return NextResponse.json({
                error: "Characters cannot be less than 2"
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
            error: "Something went wrong"
        }, {status: 500})
    }
}