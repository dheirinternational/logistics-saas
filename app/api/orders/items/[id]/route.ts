import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export async function GET(req: Request, {params}:{params: Promise<{id: string}>}){

    try{

        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const { id } = await params    

        // const { searchParams } = new URL(req.url)
        // const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                {
                success: false,
                message: "Order ID is required",
                },
                { status: 400 }
            );
        }

        const result = await pool.query(`
            SELECT 
              id,
              product_id,
              product_name,
              quantity,
              unit_price,
              subtotal,
              product_image AS image
            FROM order_items
            WHERE order_id = $1 
        `, [id])

        return NextResponse.json({
            success: true,
            message: "Order Items Successfully Retrieved",
            data: result.rows
        })
    }
    catch(err){
        console.error("Error retrieving Orders Items Data", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}