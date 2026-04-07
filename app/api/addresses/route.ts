import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export async function POST(req: Request) {
    try{
        const session = await getSession()
        if (!session){
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
            INSERT INTO addresses (user_id, country, state, city, street, postal_code)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [session.user_id, country, state, city, street, postal_code])

        return NextResponse.json({
            success: true,
            message: "Address added successfully"
        })

    }
    catch(err){
        console.error("Error Adding Address", err)
        return NextResponse.json({
            success: false,
            message: "Error Adding Address"
        })  
    }
}