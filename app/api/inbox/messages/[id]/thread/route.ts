import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/inbox/messages/[id]/thread
 * Returns the full conversation thread for a given message.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const filterCustomerId = searchParams.get("customer_id")

    // Fetch root message
    const rootRes = await pool.query(
      `
      SELECT
        m.id,
        m.title,
        m.body,
        m.is_broadcast,
        m.created_at,
        m.sender_role,
        m.sender_id,
        m.recipient_id,
        m.thread_id,
        (r.read_at IS NOT NULL) AS is_read
      FROM inbox_messages m
      LEFT JOIN inbox_read_receipts r
        ON r.message_id = m.id AND r.user_id = $1
      WHERE m.id = $2
      `,
      [session.user_id, id],
    )

    if (rootRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 })
    }

    const root = rootRes.rows[0]

    // Verify access
    const isAdmin = session.role === "admin"
    if (!isAdmin) {
      const hasAccess =
        root.is_broadcast ||
        root.recipient_id === session.user_id ||
        root.sender_id === session.user_id
      if (!hasAccess) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
      }
    }

    // Determine target customer for broadcast replies
    const targetCustomerId = isAdmin
      ? filterCustomerId
        ? Number(filterCustomerId)
        : null
      : session.user_id

    // Fetch replies
    let repliesRes
    if (root.is_broadcast) {
      if (targetCustomerId) {
        repliesRes = await pool.query(
          `
          SELECT
            m.id,
            m.body,
            m.sender_role,
            m.sender_id,
            m.recipient_id,
            m.created_at,
            u.first_name,
            u.last_name,
            cust.code AS customer_code
          FROM inbox_messages m
          LEFT JOIN users u ON u.id = (CASE WHEN m.sender_role = 'customer' THEN m.sender_id ELSE m.recipient_id END)
          LEFT JOIN customers cust ON cust.user_id = u.id
          WHERE m.parent_id = $1
            AND (m.sender_id = $2 OR m.recipient_id = $2)
          ORDER BY m.created_at ASC
          `,
          [root.id, targetCustomerId],
        )
      } else {
        // Admin viewing all broadcast replies without specific customer filter
        repliesRes = await pool.query(
          `
          SELECT
            m.id,
            m.body,
            m.sender_role,
            m.sender_id,
            m.recipient_id,
            m.created_at,
            u.first_name,
            u.last_name,
            cust.code AS customer_code
          FROM inbox_messages m
          LEFT JOIN users u ON u.id = (CASE WHEN m.sender_role = 'customer' THEN m.sender_id ELSE m.recipient_id END)
          LEFT JOIN customers cust ON cust.user_id = u.id
          WHERE m.parent_id = $1
          ORDER BY m.created_at ASC
          `,
          [root.id],
        )
      }
    } else {
      // Direct message thread
      repliesRes = await pool.query(
        `
        SELECT
          m.id,
          m.body,
          m.sender_role,
          m.sender_id,
          m.recipient_id,
          m.created_at,
          u.first_name,
          u.last_name,
          cust.code AS customer_code
        FROM inbox_messages m
        LEFT JOIN users u ON u.id = (CASE WHEN m.sender_role = 'customer' THEN m.sender_id ELSE m.recipient_id END)
        LEFT JOIN customers cust ON cust.user_id = u.id
        WHERE (m.parent_id = $1 OR (m.thread_id = $2 AND m.id != $1))
        ORDER BY m.created_at ASC
        `,
        [root.id, root.thread_id || root.id],
      )
    }

    const replies = repliesRes.rows.map((row) => ({
      id: String(row.id),
      body: row.body,
      senderRole: row.sender_role as "admin" | "customer",
      senderId: row.sender_id,
      senderName:
        row.sender_role === "admin"
          ? "DHEIR Administration"
          : row.first_name
          ? `${row.first_name} ${row.last_name ?? ""}`.trim()
          : "Customer",
      customerCode: row.customer_code || null,
      createdAt: new Date(row.created_at).toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        root: {
          id: String(root.id),
          title: root.title,
          body: root.body,
          isBroadcast: Boolean(root.is_broadcast),
          createdAt: new Date(root.created_at).toISOString(),
          isRead: Boolean(root.is_read),
        },
        replies,
      },
    })
  } catch (err) {
    console.error("GET /api/inbox/messages/[id]/thread error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
