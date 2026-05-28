export const runtime = "nodejs"

import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  const rounded = Math.floor(parsed)
  return Math.max(min, Math.min(max, rounded))
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = clampInt(searchParams.get("page"), 1, 1, 5000)
    const pageSize = clampInt(searchParams.get("pageSize"), 24, 6, 60)
    const search = (searchParams.get("search") ?? "").trim()
    const category = (searchParams.get("category") ?? "").trim()

    const where: string[] = ["p.status = 'active'"]
    const values: unknown[] = []

    if (search) {
      values.push(`%${search}%`)
      where.push(`p.name ILIKE $${values.length}`)
    }

    if (category) {
      const categoryId = Number(category)
      if (Number.isFinite(categoryId) && categoryId > 0) {
        values.push(categoryId)
        where.push(`p.category_id = $${values.length}`)
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""
    const offset = (page - 1) * pageSize

    const [countRes, productsRes] = await Promise.all([
      pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM products p
        ${whereSql}
        `,
        values,
      ),
      pool.query(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.category_id,
          p.price,
          p.discount_price,
          p.discount_min_qty,
          p.stock_quantity,
          p.low_stock_threshold,
          p.weight,
          p.weight_unit,
          p.is_featured,
          p.created_at,
          p.updated_at
        FROM products p
        ${whereSql}
        ORDER BY p.updated_at DESC
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
        `,
        [...values, pageSize, offset],
      ),
    ])

    const total = Number(countRes.rows?.[0]?.total ?? 0)

    return NextResponse.json({
      success: true,
      data: productsRes.rows,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    })
  } catch (err) {
    console.error("Error fetching shop products", err)
    return NextResponse.json(
      { success: false, message: "Failed to load shop products" },
      { status: 500 },
    )
  }
}

