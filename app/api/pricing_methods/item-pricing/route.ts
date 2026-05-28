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
            SELECT * FROM item_pricing_methods
        `)

        return NextResponse.json({
            success: true,
            message: "Item Pricing Method Pricing successfully retrieved from Database",
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

        const {id, price, rate_unit} = await req.json()

        if (!id || typeof price !== "number" || price < 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid input"
            }, { status: 400 })
        }

        if (rate_unit && !["kg", "cbm"].includes(String(rate_unit))) {
            return NextResponse.json(
                { success: false, message: "Invalid rate unit" },
                { status: 400 }
            )
        }
        
        const result = await pool.query(`
            UPDATE item_pricing_methods
                SET 
                    price_per_unit = $1,
                    price_per_kg = COALESCE(price_per_kg, $1),
                    rate_unit = COALESCE($2, rate_unit)
                WHERE id = $3
        `, [price, rate_unit ?? null, id])

        if(result.rowCount === 0){
            return NextResponse.json({
                success: false,
                message: "Item Pricing Method not found"
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