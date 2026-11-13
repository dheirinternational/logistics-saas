import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { isAdminOrStaff } from "@/lib/rbac/permissions"
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
            SELECT 
                sr.*,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', p.id,
                                'incoming_package_id', p.incoming_package_id,
                                'package_name', p.package_name,
                                'weight', p.weight,
                                'weight_unit', p.weight_unit,
                                'status', p.status
                            )
                        )
                        FROM packages p
                        WHERE p.id = ANY(sr.package_ids)
                    ),
                    '[]'::json
                ) AS packages
            FROM shipment_requests sr
            WHERE sr.id = $1 
        `, [id])

        if (res.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Shipment request not found" }, { status: 404 })
        }

        const request = res.rows[0]
        if (!isAdminOrStaff(session) && session.user_id !== request.user_id) {
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
