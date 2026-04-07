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
            SELECT * FROM payments
            WHERE user_id = $1
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