import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, {params} : {params: Promise<{id: string}>}){
    try{
        const session = await getSession()
        
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        const {id} = await params 

        const res = await pool.query(`
            SELECT * FROM shipment_requests
                WHERE id = $1 
        `, [id])

        if (res.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Shipment request not found" }, { status: 404 })
        }

        const request = res.rows[0]
        if (session.role !== "admin" && session.user_id !== request.user_id) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        return NextResponse.json({
            success: true,
            data: request
        })

    }
    catch(err){
        console.error("Error fetching shipment request", err)
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        }, {status: 500})
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const reqRes = await pool.query(
            `SELECT id, user_id, status, package_ids FROM shipment_requests WHERE id = $1`,
            [id]
        )

        if (reqRes.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Shipment request not found" }, { status: 404 })
        }

        const request = reqRes.rows[0]
        const isAdmin = session.role === "admin"
        const isOwner = session.user_id === request.user_id

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        if (!isAdmin && request.status !== "pending") {
            return NextResponse.json({ success: false, message: "Only pending requests can be cancelled" }, { status: 400 })
        }

        // Restore packages to 'stored' so user can ship them again
        if (request.package_ids && request.package_ids.length > 0) {
            await pool.query(
                `UPDATE packages SET status = 'stored' WHERE id = ANY($1)`,
                [request.package_ids]
            )
        }

        await pool.query(`DELETE FROM shipment_requests WHERE id = $1`, [id])

        return NextResponse.json({
            success: true,
            message: "Shipment request cancelled and packages returned to warehouse storage"
        })
    } catch (err) {
        console.error("Error deleting shipment request", err)
        return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 })
    }
}
