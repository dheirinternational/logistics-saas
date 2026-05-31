import { listPublicShopCatalog } from "@/lib/shop/shopCatalog"
import { pool } from "@/lib/db/db"
import { NextResponse } from "next/server"

/** Public shop catalog for landing page + customer shop category cards. */
export async function GET() {
  try {
    const [catalog, featuredRes] = await Promise.all([
      listPublicShopCatalog(),
      pool.query(
        `
        SELECT
          p.id,
          p.name,
          p.price,
          p.discount_price,
          p.discount_min_qty,
          p.stock_quantity,
          p.weight,
          p.weight_unit,
          c.name AS category_name,
          COALESCE(
            (
              SELECT pi.image_url
              FROM product_images pi
              WHERE pi.product_id = p.id
                AND COALESCE(pi.media_type, 'image') <> 'video'
              ORDER BY pi.is_primary DESC, pi.id ASC
              LIMIT 1
            ),
            (
              SELECT pi.image_url
              FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.id ASC
              LIMIT 1
            )
          ) AS image_url
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.is_featured = true
          AND p.status = 'active'
          AND p.stock_quantity > 0
        ORDER BY p.updated_at DESC
        LIMIT 4
        `
      ),
    ])

    return NextResponse.json({
      success: true,
      data: {
        featured: featuredRes.rows,
        catalog,
      },
    })
  } catch (err) {
    console.error("Error fetching shop catalog", err)
    return NextResponse.json(
      { success: false, message: "Failed to load shop catalog" },
      { status: 500 }
    )
  }
}
