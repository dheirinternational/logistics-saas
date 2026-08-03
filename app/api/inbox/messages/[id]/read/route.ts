import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/inbox/messages/[id]/read
 * Marks the given message as read for the current user.
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

    await pool.query(
      `
      INSERT INTO inbox_read_receipts (message_id, user_id)
      VALUES ($1, $2)
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
