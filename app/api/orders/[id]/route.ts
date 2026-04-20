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
            SELECT * FROM orders
            WHERE order_id = $1 
        `, [id])

        return NextResponse.json({
            success: true,
            message: "Order Successfully Retrieved",
            data: result.rows[0]
        })
    }
    catch(err){
        console.error("Error retrieving Orders Data", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}

export async function PATCH(req: Request, { params }: {params: Promise<{id: string}>}) {
    const { id } = await params
    const { status } = await req.json()

    console.log(id, status)

    await pool.query(
        `
        UPDATE orders
        SET status = $1,
            updated_at = NOW()
        WHERE order_id = $2
        `,
        [status, id]
    )

    return NextResponse.json({
        message: "Order updated"
    })
}