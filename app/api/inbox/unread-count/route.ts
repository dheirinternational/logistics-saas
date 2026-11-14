export const dynamic = "force-dynamic"
export const revalidate = 0

import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { isAdminOrStaff } from "@/lib/rbac/permissions"
import { NextResponse } from "next/server"

/**
 * GET /api/inbox/unread-count
 * Returns the count of unread inbox messages for the current user.
 * Respects ?scope=customer (or /customer referer) when an admin/staff switches to customer view.
 */
export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const scope = url.searchParams.get("scope")
    const referer = req.headers.get("referer") ?? ""
    const isAdminContext =
      isAdminOrStaff(session) &&
      scope !== "customer" &&
      (scope === "admin" || !referer.includes("/customer"))

    if (isAdminContext) {
      // For Admin: Count unread messages/replies sent by customers
      const res = await dbQuery(
        `
        SELECT COUNT(*) AS count
        FROM inbox_messages m
        LEFT JOIN inbox_read_receipts r
          ON r.message_id = m.id AND r.user_id = $1
        WHERE m.sender_role = 'customer'
          AND r.read_at IS NULL
        `,
        [session.user_id],
      )
      const count = Number(res.rows[0]?.count ?? 0)
      return NextResponse.json(
        { success: true, data: { count } },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    // For Customer: Count unread messages sent by admin / system
    const res = await dbQuery(
      `
      SELECT COUNT(*) AS count
      FROM inbox_messages m
      LEFT JOIN inbox_read_receipts r
        ON r.message_id = m.id AND r.user_id = $1
      WHERE (m.recipient_id = $1 OR m.is_broadcast = TRUE)
        AND m.sender_role = 'admin'
        AND r.read_at IS NULL
      `,
      [session.user_id],
    )

    const count = Number(res.rows[0]?.count ?? 0)
    return NextResponse.json(
      { success: true, data: { count } },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (err) {
    console.error("GET /api/inbox/unread-count error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
