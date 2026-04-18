import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export async function GET(req: Request, { params }: {params: Promise<{id: string}>}){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const { id } = await params

        const res = await pool.query(`
            SELECT * FROM package_images
                WHERE package_id = $1    
        `, [id])

        return NextResponse.json({
            message: "Products Images succesfully fetched from database",
            data: res.rows,
            success: true
        })
    
    }
    catch(err){
        console.error("Error Fetching Product Images", err)
        return NextResponse.json({
            message: "Error Fetching Product Images",
            success: false
        },{status: 500})
    }
}