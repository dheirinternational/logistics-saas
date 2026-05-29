import { dbQuery } from "@/lib/db/db"
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

    const { rows } = await dbQuery<{ open: number; total: number }>(`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('Confirmed', 'preparing'))::int AS open,
        COUNT(*)::int AS total
      FROM orders
    `)

    return NextResponse.json({
      success: true,
      message: "Order counts retrieved",
      data: { open: rows[0].open, total: rows[0].total },
    })
  } catch (err) {
    console.error("Internal Server Error", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
