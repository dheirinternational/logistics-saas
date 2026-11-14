import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/inbox/messages/[id]/read
 * Marks the given message or direct thread as read for the current user.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (id === "support-chat") {
      // Mark all direct admin messages for this customer as read
      await pool.query(
        `
        INSERT INTO inbox_read_receipts (message_id, user_id)
        SELECT m.id, $1
        FROM inbox_messages m
        WHERE (m.recipient_id = $1 OR (m.sender_id = $1 AND m.sender_role = 'customer'))
          AND m.is_broadcast = FALSE
          AND m.sender_role = 'admin'
        ON CONFLICT (user_id, message_id) DO NOTHING
        `,
        [session.user_id],
      )
      return NextResponse.json({ success: true })
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (!isUuid) {
      return NextResponse.json({ success: false, message: "Invalid message ID" }, { status: 400 })
    }

    await pool.query(
      `
      INSERT INTO inbox_read_receipts (message_id, user_id)
      SELECT m.id, $2
      FROM inbox_messages m
      WHERE m.sender_role = 'admin'
        AND (m.recipient_id = $2 OR m.is_broadcast = TRUE)
        AND (
          m.id = $1
          OR m.parent_id = $1
          OR m.thread_id = (SELECT COALESCE(thread_id, id) FROM inbox_messages WHERE id = $1 LIMIT 1)
        )
      ON CONFLICT (user_id, message_id) DO NOTHING
      `,
      [id, session.user_id],
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("POST /api/inbox/messages/[id]/read error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
