import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export async function GET() {
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const res = await pool.query(`
            SELECT id, country, state, city, street, postal_code FROM addresses
            WHERE user_id = $1
        `, [session.user_id])

        if(res.rows.length === 0){
            return NextResponse.json({
                success: false,
                message: "No address found for this user"
            }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            message: "Addresses retrieved successfully",
            data: res.rows
        })


    }
    catch(err){
        console.error("Error Fetching Addresses", err)
        return NextResponse.json({
            success: false,
            message: "Error Fetching Addresses"
        })  
    }
}


export async function PUT(req: Request){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const { country, state, city, street, postal_code } = await req.json()

        if (!country.trim() || !state.trim() || !city.trim() || !street.trim() || !postal_code.trim()){
            return NextResponse.json({
                success: false,
                message: "All fields are required"
            }, {status: 400})
        }

        await pool.query(`
            UPDATE addresses
            SET country = $1, state = $2, city = $3, street = $4, postal_code = $5
            WHERE user_id = $6
        `, [country, state, city, street, postal_code, session.user_id])

        return NextResponse.json({
            success: true,
            message: "Address updated successfully"
        })

    }catch(err){
        console.error("Error Updating Address", err)
        return NextResponse.json({
            success: false,
            message: "Error Updating Address"
        })  
    }
}