import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

/**
 * GET /api/admin/inbox/threads
 * Admin only. Returns all customer conversation threads / inquiries.
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

    const query = `
      WITH customer_conversations AS (
        SELECT
          COALESCE(root.id, m.id) AS root_id,
          COALESCE(root.title, m.title) AS root_title,
          COALESCE(root.is_broadcast, m.is_broadcast) AS is_broadcast,
          (CASE WHEN m.sender_role = 'customer' THEN m.sender_id ELSE m.recipient_id END) AS customer_id,
          m.id AS latest_message_id,
          m.body AS latest_body,
          m.sender_role AS latest_sender_role,
          m.created_at AS latest_created_at
        FROM inbox_messages m
        LEFT JOIN inbox_messages root ON root.id = m.parent_id
        WHERE m.sender_role = 'customer' OR m.parent_id IS NOT NULL
      )
      SELECT DISTINCT ON (c.root_id, c.customer_id)
        c.root_id,
        c.root_title,
        c.is_broadcast,
        c.customer_id,
        c.latest_body,
        c.latest_sender_role,
        c.latest_created_at,
        u.first_name,
        u.last_name,
        u.email AS customer_email,
        cust.code AS customer_code,
        (
          SELECT COUNT(*) 
          FROM inbox_messages unread_m
          LEFT JOIN inbox_read_receipts r ON r.message_id = unread_m.id AND r.user_id = $1
          WHERE (unread_m.id = c.root_id OR unread_m.parent_id = c.root_id)
            AND (unread_m.sender_id = c.customer_id OR unread_m.recipient_id = c.customer_id)
            AND unread_m.sender_role = 'customer'
            AND r.read_at IS NULL
        ) AS unread_count
      FROM customer_conversations c
      JOIN users u ON u.id = c.customer_id
      LEFT JOIN customers cust ON cust.user_id = u.id
      ORDER BY c.root_id, c.customer_id, c.latest_created_at DESC
    `

    const res = await pool.query(query, [session.user_id])

    const data = res.rows.map((row) => ({
      rootId: String(row.root_id),
      rootTitle: row.root_title,
      isBroadcast: Boolean(row.is_broadcast),
      customerId: Number(row.customer_id),
      customerName: row.first_name
        ? `${row.first_name} ${row.last_name ?? ""}`.trim()
        : "Customer",
      customerEmail: row.customer_email ?? "",
      customerCode: row.customer_code || null,
      latestBody: row.latest_body ?? "",
      latestSenderRole: row.latest_sender_role as "admin" | "customer",
      latestCreatedAt: new Date(row.latest_created_at).toISOString(),
      unreadCount: Number(row.unread_count ?? 0),
    }))

    // Sort by latest_created_at descending overall
    data.sort((a, b) => new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime())

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("GET /api/admin/inbox/threads error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

