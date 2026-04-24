import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"


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
            SELECT * FROM wrapping_methods
        `)

        return NextResponse.json({
            success: true,
            message: "Wrapping Method Pricing successfully retrieved from Database",
            data: result.rows
        })
    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, {status: 500})
    }
}


export async function PUT(req: NextRequest){
    try{
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        if (session.role !== "admin"){
            return NextResponse.json({
                success: false,
                message: "Forbidden",
            }, {status: 403})
        }

        const {id, price} = await req.json()

        if (!id || typeof price !== "number" || price < 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid input"
            }, { status: 400 })
        }
        
        const result = await pool.query(`
            UPDATE wrapping_methods
                SET 
                    price = $1
                WHERE id = $2     
        `, [price, id])

        if(result.rowCount === 0){
            return NextResponse.json({
                success: false,
                message: "Wrapping Method not found"
            }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            message: "Successfully updated Price"
        })
        
    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, {status: 500})
    }
}