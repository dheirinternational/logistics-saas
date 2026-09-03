import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const res = await pool.query(`
      SELECT 
        p.id,
        p.incoming_package_id,
        p.package_name,
        p.user_id,
        p.customer_code,
        p.warehouse_id,
        p.weight,
        p.weight_unit,
        p.amount,
        p.condition,
        p.status,
        p.received_at,
        p.stored_at,
        p.created_at,
        w.name AS warehouse_name
      FROM packages p
      LEFT JOIN warehouses w ON p.warehouse_id = w.id
      ORDER BY p.created_at DESC
    `)

    return NextResponse.json({
      success: true,
      data: res.rows,
    })
  } catch (err) {
    console.error("Error fetching admin inventory", err)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
