import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const requestId = Number(id)

    const reqRes = await dbQuery(
      `
      SELECT 
        pr.*,
        u.email as customer_email,
        COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''), u.email) as customer_name,
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
      JOIN users u ON u.id = pr.user_id
      LEFT JOIN procurement_media pm ON pm.request_id = pr.id
      WHERE pr.id = $1
      GROUP BY pr.id, u.id;
      `,
      [requestId]
    )

    if (reqRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 })
    }

    const msgRes = await dbQuery(
      `
      SELECT pm.*, u.email, u.role
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
        request: reqRes.rows[0],
        messages: msgRes.rows,
      },
    })
  } catch (err) {
    console.error("Error fetching single admin procurement request", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const requestId = Number(id)
    const body = await req.json()
    const {
      status,
      quote_unit_price,
      quote_domestic_freight,
      quote_total,
      quote_currency,
      quote_notes,
      admin_reply,
      china_tracking_number,
      commitment_fee_paid,
    } = body

    const updateSql = `
      UPDATE procurement_requests
      SET
        status = COALESCE($1, status),
        quote_unit_price = COALESCE($2, quote_unit_price),
        quote_domestic_freight = COALESCE($3, quote_domestic_freight),
        quote_total = COALESCE($4, quote_total),
        quote_currency = COALESCE($5, quote_currency),
        quote_notes = COALESCE($6, quote_notes),
        admin_reply = COALESCE($7, admin_reply),
        china_tracking_number = COALESCE($8, china_tracking_number),
        commitment_fee_paid = COALESCE($9, commitment_fee_paid),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *;
    `

    const { rows } = await dbQuery(updateSql, [
      status || null,
      quote_unit_price !== undefined ? Number(quote_unit_price) : null,
      quote_domestic_freight !== undefined ? Number(quote_domestic_freight) : null,
      quote_total !== undefined ? Number(quote_total) : null,
      quote_currency || null,
      quote_notes || null,
      admin_reply || null,
      china_tracking_number || null,
      commitment_fee_paid !== undefined ? Boolean(commitment_fee_paid) : null,
      requestId,
    ])

    return NextResponse.json({
      success: true,
      data: rows[0],
      message: "Procurement request updated successfully",
    })
  } catch (err) {
    console.error("Error updating procurement request", err)
    return NextResponse.json({ success: false, message: "Could not update request" }, { status: 500 })
  }
}
