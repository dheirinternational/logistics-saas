import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export async function GET(){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const { user_id } = session

        const res = await pool.query(`
            SELECT * FROM packages
            WHERE user_id = $1            
        `, [user_id])

        return NextResponse.json({
            success: true,
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