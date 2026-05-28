import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const openRes = await pool.query(
      `
        SELECT COUNT(*)::int AS count
        FROM orders
        WHERE status IN ('Confirmed', 'preparing')
      `
    )

    const totalRes = await pool.query(
      `
        SELECT COUNT(*)::int AS count
        FROM orders
      `
    )

    const open = Number(openRes.rows?.[0]?.count ?? 0)
    const total = Number(totalRes.rows?.[0]?.count ?? 0)

    return NextResponse.json({
      success: true,
      message: "Order counts retrieved",
      data: { open, total },
    })
  } catch (err) {
    console.error("Internal Server Error", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}

