import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/admin/inbox/send
 * Admin only. Sends a message — either direct (recipient_id) or broadcast (is_broadcast=true).
 *
 * Body: { title, body, recipient_id?: number, is_broadcast?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { title, body, recipient_id, is_broadcast } = await req.json()

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 },
      )
    }

    if (!is_broadcast && !recipient_id) {
      return NextResponse.json(
        { success: false, message: "Either recipient_id or is_broadcast must be set" },
        { status: 400 },
      )
    }

    await pool.query(
      `
      INSERT INTO inbox_messages (sender_id, recipient_id, title, body, is_broadcast)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        session.user_id,
        is_broadcast ? null : recipient_id,
        title.trim(),
        body.trim(),
        Boolean(is_broadcast),
      ],
    )

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (err) {
    console.error("POST /api/admin/inbox/send error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/admin/inbox/send
 * Admin only. Returns list of all sent messages with recipient info and read-receipt count.
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const res = await pool.query(`
      SELECT
        m.id,
        m.title,
        m.body,
        m.is_broadcast,
        m.created_at,
        u.first_name,
        u.last_name,
        u.email AS recipient_email,
        COUNT(r.id) AS read_count
      FROM inbox_messages m
      LEFT JOIN users u ON u.id = m.recipient_id
      LEFT JOIN inbox_read_receipts r ON r.message_id = m.id
      GROUP BY m.id, u.first_name, u.last_name, u.email
      ORDER BY m.created_at DESC
    `)

    const data = res.rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      body: row.body ?? "",
      isBroadcast: Boolean(row.is_broadcast),
      recipientName: row.first_name
        ? `${row.first_name} ${row.last_name ?? ""}`.trim()
        : null,
      recipientEmail: row.recipient_email ?? null,
      readCount: Number(row.read_count),
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("GET /api/admin/inbox/send error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
