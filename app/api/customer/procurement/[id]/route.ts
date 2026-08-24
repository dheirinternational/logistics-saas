import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const requestId = Number(id)

    const requestRes = await dbQuery(
      `
      SELECT 
        pr.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pm.id,
              'image_url', pm.image_url,
              'media_type', pm.media_type,
              'caption', pm.caption
            )
          ) FILTER (WHERE pm.id IS NOT NULL), '[]'
        ) AS images
      FROM procurement_requests pr
      LEFT JOIN procurement_media pm ON pm.request_id = pr.id
      WHERE pr.id = $1 AND (pr.user_id = $2 OR $3 = 'admin')
      GROUP BY pr.id;
      `,
      [requestId, session.user_id, session.role]
    )

    if (requestRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 })
    }

    const messagesRes = await dbQuery(
      `
      SELECT 
        pm.*,
        u.email,
        u.role
      FROM procurement_messages pm
      JOIN users u ON u.id = pm.sender_id
      WHERE pm.request_id = $1
      ORDER BY pm.created_at ASC;
      `,
      [requestId]
    )

    return NextResponse.json({
      success: true,
      data: {
        request: requestRes.rows[0],
        messages: messagesRes.rows,
      },
    })
  } catch (err) {
    console.error("Error fetching single procurement request", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const requestId = Number(id)
    const body = await req.json()
    const { message, attachment_url } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: "Message content cannot be empty" }, { status: 400 })
    }

    // Verify access
    const checkRes = await dbQuery(
      `SELECT id, user_id FROM procurement_requests WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')`,
      [requestId, session.user_id, session.role]
    )

    if (checkRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Forbidden or not found" }, { status: 403 })
    }

    const insertMsg = await dbQuery(
      `
      INSERT INTO procurement_messages (request_id, sender_id, sender_role, message, attachment_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [requestId, session.user_id, session.role === "admin" ? "admin" : "customer", message.trim(), attachment_url || null]
    )

    return NextResponse.json({
      success: true,
      data: insertMsg.rows[0],
      message: "Message sent",
    })
  } catch (err) {
    console.error("Error posting procurement message", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const requestId = Number(id)

    const checkRes = await dbQuery(
      `SELECT id, reference_number, user_id FROM procurement_requests WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')`,
      [requestId, session.user_id, session.role]
    )

    if (checkRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Procurement request not found or forbidden" }, { status: 404 })
    }

    const refNo = checkRes.rows[0].reference_number

    await dbQuery(`DELETE FROM procurement_media WHERE request_id = $1`, [requestId])
    await dbQuery(`DELETE FROM procurement_messages WHERE request_id = $1`, [requestId])
    if (refNo) {
      await dbQuery(
        `DELETE FROM manual_payment_audit_log WHERE submission_id IN (SELECT id FROM manual_payment_submissions WHERE reference = $1 OR reference = $2)`,
        [refNo, String(requestId)]
      )
      await dbQuery(
        `DELETE FROM manual_payment_submissions WHERE reference = $1 OR reference = $2`,
        [refNo, String(requestId)]
      )
    }
    await dbQuery(`DELETE FROM procurement_requests WHERE id = $1`, [requestId])

    return NextResponse.json({
      success: true,
      message: "Procurement request deleted successfully",
    })
  } catch (err) {
    console.error("Error deleting procurement request", err)
    return NextResponse.json({ success: false, message: "Could not delete procurement request" }, { status: 500 })
  }
}

