import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { rows } = await dbQuery<{ open: number; total: number }>(
      `SELECT
        COUNT(*) FILTER (WHERE status IN ('Confirmed', 'preparing', 'shipped'))::int AS open,
        COUNT(*)::int AS total
      FROM orders
      WHERE user_id = $1`,
      [session.user_id],
    )

    return NextResponse.json({
      success: true,
      data: { open: rows[0].open, total: rows[0].total },
    })
  } catch (err) {
    console.error("Order user counts error", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
