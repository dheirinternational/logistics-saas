import { pool } from "@/lib/db/db";
import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";


export async function GET(request: Request, {params}: {params: Promise<{id: string}>}){
    try{
        const session = await getSession()

        if (!session) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, {status: 401})
        }

        if(session.role !== "admin"){
            return NextResponse.json({
                success: false,
                message: "Forbidden"
            }, {status: 403})
        }

        const {id} = await params

        const res = await pool.query(`
            SELECT id, email, first_name, last_name, phone, role, created_at FROM users
            WHERE id = $1
            LIMIT 1    
        `, [id])

        if (res.rows.length === 0){
            return NextResponse.json({
                success: false,
                message: "Error! Data does not exist"
            }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            data: res.rows[0]            
        }, {status: 201})
    }
    catch(err){
        console.error("ERROR FETCHING USER DATA", err)
        return NextResponse.json({
            success: false,
            message: "Error fetching user Data"
        })
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        const userId = Number(id)

        if (!Number.isFinite(userId)) {
            return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 })
        }

        if (session.id === userId) {
            return NextResponse.json(
                { success: false, message: "You cannot delete your own admin account." },
                { status: 400 }
            )
        }

        await client.query("BEGIN")

        const customerRes = await client.query(`SELECT code FROM customers WHERE user_id = $1 LIMIT 1`, [userId])
        const customerCode: string | null = customerRes.rows[0]?.code ?? null

        await client.query(`DELETE FROM package_images WHERE package_id IN (SELECT id FROM packages WHERE user_id = $1)`, [userId])
        await client.query(`DELETE FROM shipment_images WHERE shipment_id IN (SELECT id FROM shipments WHERE user_id = $1)`, [userId])
        await client.query(
            `DELETE FROM payments
             WHERE user_id = $1
                OR shipment_tracking_number IN (
                    SELECT tracking_number FROM shipments WHERE user_id = $1
                )`,
            [userId]
        )
        await client.query(`DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = $1)`, [userId])
        await client.query(`DELETE FROM orders WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM shipment_requests WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM shipments WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM incoming_packages WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM packages WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM addresses WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM notifications WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM reviews WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM staff WHERE user_id = $1`, [userId])
        await client.query(`DELETE FROM admins WHERE user_id = $1`, [userId])

        if (customerCode) {
            await client.query(`DELETE FROM customers WHERE code = $1`, [customerCode])
        } else {
            await client.query(`DELETE FROM customers WHERE user_id = $1`, [userId])
        }

        const deleteUserRes = await client.query(`DELETE FROM users WHERE id = $1`, [userId])
        if (deleteUserRes.rowCount === 0) {
            await client.query("ROLLBACK")
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        await client.query("COMMIT")

        return NextResponse.json({ success: true, message: "User deleted" })
    } catch (err) {
        await client.query("ROLLBACK")
        console.error("ERROR DELETING USER", err)
        return NextResponse.json(
            { success: false, message: "Error deleting user. User may still have linked records." },
            { status: 500 }
        )
    } finally {
        client.release()
    }
}
