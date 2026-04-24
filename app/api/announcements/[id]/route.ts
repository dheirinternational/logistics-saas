import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"


export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}){

    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const {id} = await params

        const res = await pool.query(`
          SELECT * FROM announcements 
          WHERE id = $1
        `, [id])

        return NextResponse.json({
            success: true,
            message: "Announcement successfully retrieved from Database",
            data: res.rows[0]
        })
    }
    catch(err){
        console.error("Internal Server Error, Retrieving Announcements", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Retrieving Announcements"
        })
    }
}