import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

/**
 * GET /api/inbox/messages
 * Returns the current user's inbox (direct + broadcasts) with read status.
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const res = await pool.query(
      `
      SELECT
        m.id,
        m.title,
        m.body,
        m.is_broadcast,
        m.created_at,
        (r.read_at IS NOT NULL) AS is_read
      FROM inbox_messages m
      LEFT JOIN inbox_read_receipts r
        ON r.message_id = m.id AND r.user_id = $1
      WHERE m.recipient_id = $1 OR m.is_broadcast = TRUE
      ORDER BY m.created_at DESC
      `,
      [session.user_id],
    )

    const data = res.rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      body: row.body ?? "",
      isBroadcast: Boolean(row.is_broadcast),
      isRead: Boolean(row.is_read),
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("GET /api/inbox/messages error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
