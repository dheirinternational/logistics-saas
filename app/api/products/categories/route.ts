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

        const { rows } = await pool.query(`
            SELECT * FROM categories
        `)

        return NextResponse.json({
            message: "Categories Successfully retrieved",
            success: true,
            data: rows
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