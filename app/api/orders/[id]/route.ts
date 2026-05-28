import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { isValidOrderStatus } from "@/lib/portal/orderStatus"
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }
        if (session.role !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const status = String(body.status ?? "").trim()

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            )
        }

        if (!isValidOrderStatus(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid order status" },
                { status: 400 }
            )
        }

        const result = await pool.query(
            `
            UPDATE orders
            SET status = $1,
                updated_at = NOW(),
                updated_by = $2
            WHERE order_id = $3
            RETURNING *
            `,
            [status, session.user_id, id]
        )

        if ((result.rowCount ?? 0) < 1) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Order updated",
            data: result.rows[0],
        })
    } catch (err) {
        console.error("Error updating order", err)
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }
        if (session.role !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        const { id } = await params

        await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [id])
        await pool.query(`DELETE FROM orders WHERE order_id = $1`, [id])

        return NextResponse.json({ success: true, message: "Order deleted" })
    } catch (err) {
        console.error("Error deleting order", err)
        return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 })
    }
}
