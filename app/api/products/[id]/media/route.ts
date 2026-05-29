export const runtime = "nodejs"
export const maxDuration = 60

import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import {
  MAX_PRODUCT_MEDIA_COUNT,
  MAX_PRODUCT_MEDIA_FILE_BYTES,
  MAX_PRODUCT_MEDIA_FILE_LABEL,
} from "@/lib/products/productMediaLimits"
import { productApiErrorMessage } from "@/lib/products/productApiErrors"
import { uploadOneProductMediaFile } from "@/lib/products/uploadProductMedia"
import { NextResponse } from "next/server"

export async function POST(
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

    const { id } = await params
    const productId = Number(id)

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ success: false, message: "Invalid product id" }, { status: 400 })
    }

    const productRes = await pool.query(`SELECT id FROM products WHERE id = $1`, [productId])
    if (productRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, message: "Media file is required" }, { status: 400 })
    }

    if (file.size > MAX_PRODUCT_MEDIA_FILE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `"${file.name}" is too large. Each file must be ${MAX_PRODUCT_MEDIA_FILE_LABEL} or smaller.`,
        },
        { status: 400 }
      )
    }

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM product_images WHERE product_id = $1`,
      [productId]
    )
    const existingCount = Number(countRes.rows[0]?.count ?? 0)

    if (existingCount >= MAX_PRODUCT_MEDIA_COUNT) {
      return NextResponse.json(
        {
          success: false,
          message: `This product already has the maximum of ${MAX_PRODUCT_MEDIA_COUNT} media files`,
        },
        { status: 400 }
      )
    }

    const isPrimary =
      formData.get("is_primary") === "true" || existingCount === 0

    const uploaded = await uploadOneProductMediaFile(productId, file, existingCount)

    await pool.query(
      `
      INSERT INTO product_images (product_id, image_url, is_primary, media_type)
      VALUES ($1, $2, $3, $4)
      `,
      [productId, uploaded.url, isPrimary, uploaded.media_type]
    )

    return NextResponse.json({
      success: true,
      message: "Media uploaded",
      data: uploaded,
    })
  } catch (err) {
    console.error("Error uploading product media", err)

    return NextResponse.json(
      {
        success: false,
        message: productApiErrorMessage(err, "Could not upload product media"),
      },
      { status: 500 }
    )
  }
}
