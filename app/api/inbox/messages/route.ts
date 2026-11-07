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

    // 1. Fetch broadcast announcements
    const broadcastsRes = await pool.query(
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
      WHERE m.is_broadcast = TRUE
        AND m.parent_id IS NULL
      ORDER BY m.created_at DESC
      `,
      [session.user_id],
    )

    // 2. Fetch the unified direct support chat for this customer
    const directRes = await pool.query(
      `
      SELECT
        root.id AS root_id,
        latest.body AS latest_body,
        COALESCE(latest.created_at, root.created_at) AS latest_created_at,
        (
          SELECT COUNT(*)
          FROM inbox_messages unread_m
          LEFT JOIN inbox_read_receipts r ON r.message_id = unread_m.id AND r.user_id = $1
          WHERE (unread_m.id = root.id OR unread_m.parent_id = root.id OR unread_m.thread_id = root.id)
            AND unread_m.sender_role = 'admin'
            AND r.read_at IS NULL
        ) AS unread_admin_messages
      FROM inbox_messages root
      LEFT JOIN LATERAL (
        SELECT body, created_at
        FROM inbox_messages
        WHERE thread_id = root.id OR id = root.id OR parent_id = root.id
        ORDER BY created_at DESC
        LIMIT 1
      ) latest ON true
      WHERE root.is_broadcast = FALSE
        AND (root.recipient_id = $1 OR root.sender_id = $1)
        AND root.parent_id IS NULL
      ORDER BY root.created_at ASC
      LIMIT 1
      `,
      [session.user_id],
    )

    const data: Array<{
      id: string
      title: string
      body: string
      isBroadcast: boolean
      isRead: boolean
      createdAt: string
    }> = []

    // Always include exactly ONE unified Support Chat entry
    if (directRes.rows.length > 0) {
      const d = directRes.rows[0]
      data.push({
        id: String(d.root_id),
        title: "DHEIR Support",
        body: d.latest_body || "Chat directly with DHEIR administration.",
        isBroadcast: false,
        isRead: Number(d.unread_admin_messages ?? 0) === 0,
        createdAt: d.latest_created_at
          ? new Date(d.latest_created_at).toISOString()
          : new Date().toISOString(),
      })
    } else {
      data.push({
        id: "support-chat",
        title: "DHEIR Support",
        body: "Chat directly with DHEIR administration.",
        isBroadcast: false,
        isRead: true,
        createdAt: new Date().toISOString(),
      })
    }

    // Append broadcasts
    for (const row of broadcastsRes.rows) {
      data.push({
        id: String(row.id),
        title: row.title,
        body: row.body ?? "",
        isBroadcast: true,
        isRead: Boolean(row.is_read),
        createdAt: row.created_at
          ? new Date(row.created_at).toISOString()
          : new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("GET /api/inbox/messages error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
