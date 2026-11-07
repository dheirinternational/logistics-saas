import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

/**
 * GET /api/admin/inbox/threads
 * Admin only. Returns unified customer conversation threads (1 per customer for direct chat, plus broadcast replies).
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
      WITH all_conversations AS (
        -- Direct chat: 1 per customer
        SELECT
          (
            SELECT id FROM inbox_messages
            WHERE is_broadcast = FALSE 
              AND (recipient_id = cust_user.id OR sender_id = cust_user.id)
              AND parent_id IS NULL
            ORDER BY created_at ASC LIMIT 1
          ) AS root_id,
          'Support Chat'::text AS root_title,
          false AS is_broadcast,
          cust_user.id AS customer_id,
          latest.body AS latest_body,
          latest.sender_role AS latest_sender_role,
          latest.created_at AS latest_created_at,
          (
            SELECT COUNT(*)
            FROM inbox_messages unread_m
            LEFT JOIN inbox_read_receipts r ON r.message_id = unread_m.id AND r.user_id = $1
            WHERE unread_m.is_broadcast = FALSE
              AND (unread_m.sender_id = cust_user.id OR unread_m.recipient_id = cust_user.id)
              AND unread_m.sender_role = 'customer'
              AND r.read_at IS NULL
          ) AS unread_count
        FROM (
          SELECT DISTINCT (CASE WHEN sender_role = 'customer' THEN sender_id ELSE recipient_id END) AS id
          FROM inbox_messages
          WHERE is_broadcast = FALSE
        ) cust_user
        JOIN LATERAL (
          SELECT body, sender_role, created_at
          FROM inbox_messages
          WHERE is_broadcast = FALSE
            AND (sender_id = cust_user.id OR recipient_id = cust_user.id)
          ORDER BY created_at DESC
          LIMIT 1
        ) latest ON true
        WHERE cust_user.id IS NOT NULL

        UNION ALL

        -- Broadcast replies: grouped by (root_id, customer_id)
        SELECT
          root.id AS root_id,
          root.title AS root_title,
          true AS is_broadcast,
          b_pair.customer_id,
          latest.body AS latest_body,
          latest.sender_role AS latest_sender_role,
          latest.created_at AS latest_created_at,
          (
            SELECT COUNT(*)
            FROM inbox_messages unread_m
            LEFT JOIN inbox_read_receipts r ON r.message_id = unread_m.id AND r.user_id = $1
            WHERE unread_m.parent_id = root.id
              AND (unread_m.sender_id = b_pair.customer_id OR unread_m.recipient_id = b_pair.customer_id)
              AND unread_m.sender_role = 'customer'
              AND r.read_at IS NULL
          ) AS unread_count
        FROM (
          SELECT DISTINCT m.parent_id AS root_id, (CASE WHEN m.sender_role = 'customer' THEN m.sender_id ELSE m.recipient_id END) AS customer_id
          FROM inbox_messages m
          JOIN inbox_messages r ON r.id = m.parent_id
          WHERE r.is_broadcast = TRUE
        ) b_pair
        JOIN inbox_messages root ON root.id = b_pair.root_id
        JOIN LATERAL (
          SELECT body, sender_role, created_at
          FROM inbox_messages
          WHERE parent_id = root.id
            AND (sender_id = b_pair.customer_id OR recipient_id = b_pair.customer_id)
          ORDER BY created_at DESC
          LIMIT 1
        ) latest ON true
      )
      SELECT c.*, u.first_name, u.last_name, u.email AS customer_email, cust.code AS customer_code
      FROM all_conversations c
      JOIN users u ON u.id = c.customer_id
      LEFT JOIN customers cust ON cust.user_id = u.id
      ORDER BY c.latest_created_at DESC
    `

    const res = await pool.query(query, [session.user_id])

    const data = res.rows
      .filter((row) => row.root_id) // ensure root_id exists
      .map((row) => ({
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

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("GET /api/admin/inbox/threads error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
