import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { linkProductMediaAssets } from "@/lib/products/linkProductMedia"
import { parseProductStoragePath } from "@/lib/products/uploadProductMedia"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL!
    : process.env.NEXT_PUBLIC_SUPABASE_URL_TEST!,
  process.env.NODE_ENV === "production"
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.SUPABASE_SERVICE_ROLE_KEY_TEST!
)

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const res = await dbQuery(
      `
      SELECT id, created_at, product_id, image_url, is_primary, media_type, media_asset_id
      FROM product_images
      WHERE product_id = $1
      ORDER BY is_primary DESC, id ASC
      `,
      [id]
    )

    return NextResponse.json({
      message: "Products Images succesfully fetched from database",
      data: res.rows,
      success: true,
    })
  } catch (err) {
    console.error("Error Fetching Product Images", err)
    return NextResponse.json(
      { message: "Error Fetching Product Images", success: false },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const productId = Number(id)
    const body = await req.json().catch(() => null)
    const assetIds = Array.isArray(body?.media_asset_ids)
      ? body.media_asset_ids.map((v: unknown) => Number(v)).filter((n: number) => Number.isFinite(n) && n > 0)
      : []

    await linkProductMediaAssets(productId, assetIds)

    return NextResponse.json({ success: true, message: "Media linked to product" })
  } catch (err) {
    console.error("Error linking product media:", err)
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id: productId } = await params
    const body = await req.json()
    const imageId = Number(body.image_id)
    if (!Number.isFinite(imageId) || imageId <= 0) {
      return NextResponse.json({ success: false, message: "Invalid media id" }, { status: 400 })
    }

    await dbQuery(`UPDATE product_images SET is_primary = false WHERE product_id = $1`, [
      productId,
    ])
    const res = await dbQuery(
      `UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2`,
      [imageId, productId]
    )

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Media not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Cover updated" })
  } catch (err) {
    console.error("Error setting product cover:", err)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id: productId } = await params
    const { searchParams } = new URL(req.url)
    const imageId = Number(searchParams.get("image_id"))

    if (!Number.isFinite(imageId) || imageId <= 0) {
      return NextResponse.json({ success: false, message: "Invalid media id" }, { status: 400 })
    }

    const imgRes = await dbQuery<{
      image_url: string
      is_primary: boolean
      media_asset_id: number | null
    }>(
      `SELECT image_url, is_primary, media_asset_id FROM product_images WHERE id = $1 AND product_id = $2`,
      [imageId, productId]
    )

    if (imgRes.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Media not found" }, { status: 404 })
    }

    const row = imgRes.rows[0]

    await dbQuery(`DELETE FROM product_images WHERE id = $1 AND product_id = $2`, [
      imageId,
      productId,
    ])

    if (row.is_primary) {
      await dbQuery(
        `
        UPDATE product_images
        SET is_primary = true
        WHERE id = (
          SELECT id FROM product_images
          WHERE product_id = $1
          ORDER BY id ASC
          LIMIT 1
        )
        `,
        [productId]
      )
    }

    if (row.media_asset_id == null) {
      const storagePath = parseProductStoragePath(row.image_url)
      if (storagePath && !storagePath.startsWith("media-library/")) {
        const { error } = await supabase.storage.from("products").remove([storagePath])
        if (error) {
          console.error("Supabase media delete failed:", error)
        }
      }
    }

    return NextResponse.json({ success: true, message: "Media removed" })
  } catch (err) {
    console.error("Error deleting product media:", err)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}
