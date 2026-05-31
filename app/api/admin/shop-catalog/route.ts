import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import {
  getNextShopCatalogSortOrder,
  listAdminShopCatalog,
} from "@/lib/shop/shopCatalog"
import { NextRequest, NextResponse } from "next/server"

async function requireAdminSession() {
  const session = await getSession()
  if (!session) {
    return { error: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) }
  }
  if (session.role !== "admin") {
    return { error: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }) }
  }
  return { session }
}

export async function GET() {
  try {
    const auth = await requireAdminSession()
    if ("error" in auth) return auth.error

    const data = await listAdminShopCatalog()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err) {
    console.error("Admin shop catalog list failed:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminSession()
    if ("error" in auth) return auth.error

    const {
      title,
      description = "",
      media_asset_id = null,
      image_url = null,
      image_alt = "",
      category_id = null,
      sort_order,
      is_active = true,
    } = await req.json()

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      )
    }

    if (!media_asset_id && !image_url?.trim()) {
      return NextResponse.json(
        { success: false, message: "Choose an image from the media library" },
        { status: 400 }
      )
    }

    const nextSortOrder =
      typeof sort_order === "number" ? sort_order : await getNextShopCatalogSortOrder()

    let resolvedImageUrl = image_url?.trim() || null
    if (media_asset_id) {
      const mediaRes = await pool.query(
        `SELECT public_url, media_type FROM media_assets WHERE id = $1 LIMIT 1`,
        [media_asset_id]
      )
      if (mediaRes.rowCount === 0) {
        return NextResponse.json(
          { success: false, message: "Selected media asset was not found" },
          { status: 400 }
        )
      }
      if (mediaRes.rows[0].media_type !== "image") {
        return NextResponse.json(
          { success: false, message: "Catalog cards must use an image" },
          { status: 400 }
        )
      }
      resolvedImageUrl = mediaRes.rows[0].public_url
    }

    const result = await pool.query(
      `
      INSERT INTO shop_catalog (
        title,
        description,
        media_asset_id,
        image_url,
        image_alt,
        category_id,
        sort_order,
        is_active,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id
      `,
      [
        title.trim(),
        String(description ?? "").trim(),
        media_asset_id,
        resolvedImageUrl,
        String(image_alt ?? title).trim(),
        category_id,
        nextSortOrder,
        is_active !== false,
      ]
    )

    return NextResponse.json({
      success: true,
      message: "Catalog item created",
      data: { id: result.rows[0].id },
    })
  } catch (err) {
    console.error("Admin shop catalog create failed:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
