import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";



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
            SELECT * FROM express_pricing_templates
            ORDER BY name
        `)

        return NextResponse.json({
            success: true,
            message: "Successfully fetched express pricing template",
            data: result.rows
        })

    }
    catch(err){
        console.error("Internal Server Error, Cannot get express pricing template", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Cannot get express pricing template"
        }, {status: 500})
    }
}



export async function PATCH(req: NextRequest){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "unauthorized"
            }, {status: 401})
        }

        if(session.role !== "admin"){
            return NextResponse.json({
                success: false,
                message: "Forbidden"
            }, {status: 403})
        }

        const body = await req.json()


        await pool.query(`
          UPDATE express_pricing_templates
            SET price = COALESCE($1, price),
                clearance = COALESCE($2, clearance),
                min_duration = COALESCE($3, min_duration),
                max_duration = COALESCE($4, max_duration),
                duration_type = COALESCE($5, duration_type),
                rate_unit = COALESCE($6, rate_unit)
            WHERE id = $7
        `, [body.price, body.clearance, body.min_duration, body.max_duration, body.duration_type, body.rate_unit, body.id])

        return NextResponse.json({
            success: true,
            message: "Successfully updated air pricing templates"
        })

    }
    catch(err){
        console.error("Internal Server Error, cannot update air pricing list", err)
        return NextResponse.json({
            success: true,
            message: "Internal Server Error, cannot update air pricing list"
        })
    }
}