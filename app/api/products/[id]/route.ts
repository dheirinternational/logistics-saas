import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET(req: Request, {params} : {params: Promise<{id: string}>}){
    try{
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const {id} = await params


        const res = await pool.query(`
            SELECT * FROM products   
                WHERE id = $1 
        `, [id])

        return NextResponse.json({
            message: "Products succesfully fetched from database",
            data: res.rows[0],
            success: true
        })
    }
    catch(err){
        console.error("Error Fetching Data from Database", err)
        return NextResponse.json({
            message: "Error Fetching Products from Database",
            success: false
        })
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const client = await pool.connect()
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        if (session.role !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        const { id } = await params

        await client.query("BEGIN")
        await client.query(`DELETE FROM product_images WHERE product_id = $1`, [id])
        await client.query(`DELETE FROM products WHERE id = $1`, [id])
        await client.query("COMMIT")

        return NextResponse.json({ success: true, message: "Product deleted" })
    } catch (err) {
        await client.query("ROLLBACK")
        console.error("Error deleting product", err)
        return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 })
    } finally {
        client.release()
    }
}