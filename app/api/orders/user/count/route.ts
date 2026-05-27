import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const openRes = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM orders
      WHERE user_id = $1
        AND status IN ('Confirmed', 'processing', 'shipped')
      `,
      [session.user_id]
    )

    const totalRes = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM orders
      WHERE user_id = $1
      `,
      [session.user_id]
    )

    const open = Number(openRes.rows?.[0]?.count ?? 0)
    const total = Number(totalRes.rows?.[0]?.count ?? 0)

    return NextResponse.json({
      success: true,
      data: { open, total },
    })
  } catch (err) {
    console.error("Order user counts error", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

