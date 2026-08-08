import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const typeFilter = searchParams.get("type")
    const statusFilter = searchParams.get("status")

    let sql = `
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
        ) AS images,
        (
          SELECT COUNT(*)::int 
          FROM procurement_messages msg 
          WHERE msg.request_id = pr.id
        ) AS message_count
      FROM procurement_requests pr
      JOIN users u ON u.id = pr.user_id
      LEFT JOIN procurement_media pm ON pm.request_id = pr.id
      WHERE 1=1
    `
    const params: any[] = []

    if (typeFilter && ["procurement", "sourcing", "verification"].includes(typeFilter)) {
      params.push(typeFilter)
      sql += ` AND pr.request_type = $${params.length}`
    }

    if (statusFilter && statusFilter !== "all") {
      params.push(statusFilter)
      sql += ` AND pr.status = $${params.length}`
    }

    sql += ` GROUP BY pr.id, u.id ORDER BY pr.created_at DESC;`

    const { rows } = await dbQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (err) {
    console.error("Error fetching admin procurement list", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
