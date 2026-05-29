export const runtime = "nodejs"

import { pool } from "@/lib/db/db"
import { NextResponse } from "next/server"

/** Public read - featured products for landing shop teaser (max 4). */
export async function GET() {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.category_id,
        p.price,
        p.discount_price,
        p.discount_min_qty,
        p.stock_quantity,
        c.name AS category_name,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.id ASC
          LIMIT 1
        ) AS image_url
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_featured = true
        AND p.status = 'active'
        AND p.stock_quantity > 0
      ORDER BY p.updated_at DESC
      LIMIT 4
      `
    )

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (err) {
    console.error("Error fetching featured products", err)
    return NextResponse.json(
      { success: false, message: "Failed to load featured products" },
      { status: 500 }
    )
  }
}
