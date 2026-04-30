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

        const result = await pool.query(`
            SELECT * FROM air_pricing_templates
            ORDER BY name
        `)

        return NextResponse.json({
            success: true,
            message: "Successfully fetched Air pricing template",
            data: result.rows
        })

    }
    catch(err){
        console.error("Internal Server Error, Cannot get air pricing template", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Cannot get air pricing template"
        }, {status: 500})
    }
}