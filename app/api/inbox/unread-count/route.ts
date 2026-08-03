import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

/**
 * GET /api/inbox/unread-count
 * Returns the count of unread inbox messages for the current user.
 * Lightweight — used for sidebar badge. Does a single COUNT query.
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const res = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM inbox_messages m
      LEFT JOIN inbox_read_receipts r
        ON r.message_id = m.id AND r.user_id = $1
      WHERE (m.recipient_id = $1 OR m.is_broadcast = TRUE)
        AND r.read_at IS NULL
      `,
      [session.user_id],
    )

    const count = Number(res.rows[0]?.count ?? 0)
    return NextResponse.json({ success: true, data: { count } })
  } catch (err) {
    console.error("GET /api/inbox/unread-count error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
