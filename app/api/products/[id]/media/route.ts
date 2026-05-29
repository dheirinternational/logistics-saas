export const runtime = "nodejs"
export const maxDuration = 60

import { databaseErrorResponse, dbQuery, DatabaseUnavailableError } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { linkMediaAssetsToProductWithPool } from "@/lib/media/mediaAssets"
import { MAX_PRODUCT_MEDIA_COUNT } from "@/lib/products/productMediaLimits"
import { productApiErrorMessage } from "@/lib/products/productApiErrors"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let session
    try {
      session = await getSession()
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        return NextResponse.json(
          { success: false, message: err.message },
          { status: 503 }
        )
      }
      throw err
    }

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const productId = Number(id)

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ success: false, message: "Invalid product id" }, { status: 400 })
    }

    const productRes = await dbQuery(`SELECT id FROM products WHERE id = $1`, [productId])
    if (productRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    const body = await req.json().catch(() => null)
    const assetIds = Array.isArray(body?.media_asset_ids)
      ? body.media_asset_ids.map((v: unknown) => Number(v)).filter((n: number) => Number.isFinite(n) && n > 0)
      : []

    if (assetIds.length < 1) {
      return NextResponse.json(
        { success: false, message: "Select at least one item from the media library." },
        { status: 400 }
      )
    }

    const countRes = await dbQuery(
      `SELECT COUNT(*)::int AS count FROM product_images WHERE product_id = $1`,
      [productId]
    )
    const existingCount = Number(countRes.rows[0]?.count ?? 0)

    if (existingCount + assetIds.length > MAX_PRODUCT_MEDIA_COUNT) {
      return NextResponse.json(
        {
          success: false,
          message: `This product can have at most ${MAX_PRODUCT_MEDIA_COUNT} media items.`,
        },
        { status: 400 }
      )
    }

    await linkMediaAssetsToProductWithPool(productId, assetIds, MAX_PRODUCT_MEDIA_COUNT)

    return NextResponse.json({
      success: true,
      message: "Media linked to product",
    })
  } catch (err) {
    console.error("Error linking product media", err)

    const { message, status } = databaseErrorResponse(err, "Could not link product media")

    return NextResponse.json(
      {
        success: false,
        message: productApiErrorMessage(err, message),
      },
      { status }
    )
  }
}
