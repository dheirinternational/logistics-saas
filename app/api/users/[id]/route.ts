import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";


export async function GET(response: Response, {params}: {params: Promise<{id: string}>}){
    try{
        const session = await getSession()

        if (!session) {
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

        const {id} = await params

        const res = await pool.query(`
            SELECT id, email, first_name, last_name, phone, role, created_at FROM users
            WHERE id = $1
            LIMIT 1    
        `, [id])

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
