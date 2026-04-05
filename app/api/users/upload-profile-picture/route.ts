import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";


export async function PUT (req: NextRequest) {
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, {status: 401})
        }

        const {image_url} = await req.json()
        
        if(!image_url){
            return NextResponse.json({
                message: "Upload Image",
                success: false
            }, {status: 400})
        }
        
        const {user_id} = session

        await pool.query(`
            UPDATE users
                SET profile_img = $1
                WHERE id = $2
        `, [image_url, user_id])

        return NextResponse.json({
            success: true,
            message: "Image Succesfully Uploaded" 
        }, {status: 200})

    }   
    catch(err){
        console.error(err)
        return NextResponse.json({
            message: "Something Went wrong",
            success: false
        }, {status: 500})
    }
}