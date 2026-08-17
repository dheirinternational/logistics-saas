import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

function generateProcurementRef(type: string): string {
  const prefix = type === "sourcing" ? "DHI-SRC" : type === "verification" ? "DHI-VRF" : "DHI-PRC"
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  return `${prefix}-${dateStr}-${random}`
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const typeFilter = searchParams.get("type")
    const statusFilter = searchParams.get("status")

    let sql = `
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
        ) AS images,
        (
          SELECT COUNT(*)::int 
          FROM procurement_messages msg 
          WHERE msg.request_id = pr.id
        ) AS message_count
      FROM procurement_requests pr
      LEFT JOIN procurement_media pm ON pm.request_id = pr.id
      WHERE pr.user_id = $1
    `
    const params: any[] = [session.user_id]

    if (typeFilter && ["procurement", "sourcing", "verification"].includes(typeFilter)) {
      params.push(typeFilter)
      sql += ` AND pr.request_type = $${params.length}`
    }

    if (statusFilter && statusFilter !== "all") {
      params.push(statusFilter)
      sql += ` AND pr.status = $${params.length}`
    }

    sql += ` GROUP BY pr.id ORDER BY pr.created_at DESC;`

    const { rows } = await dbQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (err) {
    console.error("Error fetching customer procurement requests", err)
    return NextResponse.json({ success: false, message: "Could not fetch procurement requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      request_type,
      title,
      product_url,
      target_price_rmb,
      quantity,
      variant_details,
      packaging_instruction,
      quality_grade,
      target_budget,
      budget_currency,
      supplier_name,
      supplier_address,
      supplier_contact,
      verification_scope,
      customer_note,
      image_urls,
    } = body

    if (!request_type || !["procurement", "sourcing", "verification"].includes(request_type)) {
      return NextResponse.json({ success: false, message: "Invalid request type" }, { status: 400 })
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Title / Product description is required" }, { status: 400 })
    }

    // Lookup customer code
    const userRes = await dbQuery<{ customer_code: string }>(
      `SELECT c.code as customer_code FROM users u LEFT JOIN customers c ON c.user_id = u.id WHERE u.id = $1`,
      [session.user_id]
    )
    const customerCode = userRes.rows[0]?.customer_code || `CUST-${session.user_id}`

    const refNumber = generateProcurementRef(request_type)

    const insertSql = `
      INSERT INTO procurement_requests (
        user_id,
        customer_code,
        request_type,
        status,
        reference_number,
        title,
        product_url,
        target_price_rmb,
        quantity,
        variant_details,
        packaging_instruction,
        quality_grade,
        target_budget,
        budget_currency,
        supplier_name,
        supplier_address,
        supplier_contact,
        verification_scope,
        customer_note,
        commitment_fee
      )
      VALUES (
        $1, $2, $3, 'submitted', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      RETURNING *;
    `

function parseAmount(val: any): number | null {
  if (val == null || val === "") return null
  if (typeof val === "number") return isNaN(val) ? null : val
  const cleaned = String(val).replace(/[^0-9.-]/g, "")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseQuantity(val: any): number {
  if (val == null || val === "") return 1
  if (typeof val === "number") return isNaN(val) || val <= 0 ? 1 : Math.floor(val)
  const cleaned = String(val).replace(/[^0-9]/g, "")
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) || parsed <= 0 ? 1 : parsed
}

function normalizeUrl(raw: any): string | null {
  if (!raw || typeof raw !== "string") return null
  let trimmed = raw.trim()
  if (!trimmed) return null

  // Extract URL pattern if surrounded by text (e.g. from 1688 / Taobao app share text)
  const urlMatch = trimmed.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/i)
  if (urlMatch) {
    trimmed = urlMatch[0]
  }

  if (trimmed.startsWith("www.")) {
    trimmed = "https://" + trimmed
  } else if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && trimmed.includes(".")) {
    trimmed = "https://" + trimmed
  }
  return trimmed
}

    const commitmentFee = request_type === "verification" ? 25000 : 20000

    const normalizedProductUrl = normalizeUrl(product_url) || (product_url ? String(product_url).trim() : null)

    const { rows } = await dbQuery(insertSql, [
      session.user_id,
      customerCode,
      request_type,
      refNumber,
      title.trim(),
      normalizedProductUrl,
      parseAmount(target_price_rmb),
      parseQuantity(quantity),
      variant_details || null,
      packaging_instruction || null,
      quality_grade || null,
      parseAmount(target_budget),
      budget_currency || "NGN",
      supplier_name || null,
      supplier_address || null,
      supplier_contact || null,
      verification_scope || null,
      customer_note || null,
      commitmentFee,
    ])

    const createdRequest = rows[0]

    // Insert media if provided
    if (Array.isArray(image_urls) && image_urls.length > 0) {
      for (const url of image_urls) {
        if (typeof url === "string" && url.trim()) {
          await dbQuery(
            `INSERT INTO procurement_media (request_id, image_url, media_type) VALUES ($1, $2, 'image')`,
            [createdRequest.id, url.trim()]
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: createdRequest,
      message: `${request_type.charAt(0).toUpperCase() + request_type.slice(1)} request submitted successfully`,
    })
  } catch (err) {
    console.error("Error creating procurement request", err)
    return NextResponse.json({ success: false, message: "Could not submit procurement request" }, { status: 500 })
  }
}
