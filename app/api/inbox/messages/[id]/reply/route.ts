import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/inbox/messages/[id]/reply
 * Sends a message or reply in a conversation thread.
 *
 * Body: { body: string, recipient_id?: number }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const json = await req.json()
    const text = typeof json?.body === "string" ? json.body.trim() : ""
    const targetRecipientId = json?.recipient_id ? Number(json.recipient_id) : null

    if (!text) {
      return NextResponse.json(
        { success: false, message: "Message cannot be empty" },
        { status: 400 },
      )
    }

    const isAdmin = session.role === "admin"
    let root: any = null

    if (id === "support-chat") {
      // Find customer's existing direct root message
      const existingRes = await pool.query(
        `
        SELECT id, title, is_broadcast, sender_id, recipient_id, thread_id
        FROM inbox_messages
        WHERE is_broadcast = FALSE
          AND (recipient_id = $1 OR sender_id = $1)
          AND parent_id IS NULL
        ORDER BY created_at ASC
        LIMIT 1
        `,
        [session.user_id],
      )

      if (existingRes.rows.length > 0) {
        root = existingRes.rows[0]
      } else {
        // First message initiated by this customer
        const insertRes = await pool.query(
          `
          INSERT INTO inbox_messages (
            sender_id,
            recipient_id,
            sender_role,
            title,
            body,
            is_broadcast
          ) VALUES ($1, NULL, 'customer', 'Support Chat', $2, false)
          RETURNING id, body, sender_role, sender_id, recipient_id, created_at
          `,
          [session.user_id, text],
        )

        const created = insertRes.rows[0]
        await pool.query(
          `UPDATE inbox_messages SET thread_id = id WHERE id = $1`,
          [created.id],
        )

        await pool.query(
          `
          INSERT INTO inbox_read_receipts (message_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, message_id) DO NOTHING
          `,
          [created.id, session.user_id],
        )

        const userRes = await pool.query(
          `SELECT u.first_name, u.last_name, cust.code
           FROM users u
           LEFT JOIN customers cust ON cust.user_id = u.id
           WHERE u.id = $1`,
          [session.user_id],
        )
        const author = userRes.rows[0]

        return NextResponse.json({
          success: true,
          data: {
            id: String(created.id),
            body: created.body,
            senderRole: "customer",
            senderId: session.user_id,
            senderName: author?.first_name
              ? `${author.first_name} ${author.last_name ?? ""}`.trim()
              : "Customer",
            customerCode: author?.code || null,
            createdAt: new Date(created.created_at).toISOString(),
          },
        })
      }
    } else {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      if (!isUuid) {
        return NextResponse.json({ success: false, message: "Invalid message ID" }, { status: 400 })
      }

      const rootRes = await pool.query(
        `
        SELECT id, title, is_broadcast, sender_id, recipient_id, thread_id
        FROM inbox_messages
        WHERE id = $1
        `,
        [id],
      )

      if (rootRes.rows.length === 0) {
        return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 })
      }
      root = rootRes.rows[0]
    }

    if (!isAdmin) {
      // Customer access check
      const hasAccess =
        root.is_broadcast ||
        root.recipient_id === session.user_id ||
        root.sender_id === session.user_id
      if (!hasAccess) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
      }
    }

    const senderRole = isAdmin ? "admin" : "customer"
    const senderId = session.user_id
    const threadId = root.thread_id || root.id

    // Determine recipient
    let recipientId: number | null = null
    if (isAdmin) {
      if (targetRecipientId) {
        recipientId = targetRecipientId
      } else if (!root.is_broadcast) {
        recipientId = root.sender_role === "customer" ? root.sender_id : root.recipient_id
      } else {
        return NextResponse.json(
          { success: false, message: "Recipient customer is required for admin reply" },
          { status: 400 },
        )
      }
    } else {
      recipientId = root.sender_role === "admin" ? root.sender_id : (root.recipient_id || null)
    }

    const title = root.title.startsWith("Re: ") ? root.title : `Re: ${root.title}`

    const insertRes = await pool.query(
      `
      INSERT INTO inbox_messages (
        sender_id,
        recipient_id,
        sender_role,
        parent_id,
        thread_id,
        title,
        body,
        is_broadcast
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, false)
      RETURNING id, body, sender_role, sender_id, recipient_id, created_at
      `,
      [
        senderId,
        recipientId,
        senderRole,
        root.id,
        threadId,
        title,
        text,
      ],
    )

    const reply = insertRes.rows[0]

    // Mark as read by the author immediately
    await pool.query(
      `
      INSERT INTO inbox_read_receipts (message_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, message_id) DO NOTHING
      `,
      [reply.id, session.user_id],
    )

    // Fetch author details
    const userRes = await pool.query(
      `SELECT u.first_name, u.last_name, cust.code 
       FROM users u 
       LEFT JOIN customers cust ON cust.user_id = u.id 
       WHERE u.id = $1`,
      [session.user_id],
    )
    const author = userRes.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: String(reply.id),
        body: reply.body,
        senderRole: reply.sender_role as "admin" | "customer",
        senderId: reply.sender_id,
        senderName:
          reply.sender_role === "admin"
            ? "DHEIR Administration"
            : author?.first_name
            ? `${author.first_name} ${author.last_name ?? ""}`.trim()
            : "Customer",
        customerCode: author?.code || null,
        createdAt: new Date(reply.created_at).toISOString(),
      },
    })
  } catch (err) {
    console.error("POST /api/inbox/messages/[id]/reply error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
