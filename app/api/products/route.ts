export const runtime = "nodejs"
export const maxDuration = 60

import { databaseErrorResponse, dbQuery, DatabaseUnavailableError } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { MAX_PRODUCT_MEDIA_COUNT } from "@/lib/products/productMediaLimits"
import {
  getValidProductMediaFiles,
  uploadProductMediaFiles,
} from "@/lib/products/uploadProductMedia"
import {
  type ProductCreateInput,
  validateProductCreateInput,
} from "@/lib/products/validateProductCreate"
import { linkProductMediaAssets } from "@/lib/products/linkProductMedia"
import { productApiErrorMessage } from "@/lib/products/productApiErrors"
import { isValidProductWeightUnit } from "@/lib/shop/productWeight"
import { NextRequest, NextResponse } from "next/server"
import type { PoolClient } from "pg"
import { pool } from "@/lib/db/db"

function parseProductFields(raw: Record<string, FormDataEntryValue | unknown>): ProductCreateInput {
  return {
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    category_id: Number(raw.category_id),
    price: Number(raw.price),
    discount_price: Number(raw.discount_price ?? 0),
    discount_min_qty: raw.discount_min_qty
      ? Number(raw.discount_min_qty)
      : null,
    stock_quantity: Number(raw.stock_quantity),
    weight: Number(raw.weight),
    weight_unit: String(raw.weight_unit ?? "kg"),
    is_featured: raw.is_featured === "true" || raw.is_featured === true,
  }
}

async function insertProduct(data: ProductCreateInput, userId: number) {
  const { rows } = await dbQuery<{ id: number }>(
    `
    INSERT INTO products (
      name,
      description,
      category_id,
      price,
      discount_price,
      discount_min_qty,
      stock_quantity,
      low_stock_threshold,
      cost_price,
      weight,
      weight_unit,
      is_featured,
      created_at,
      created_by,
      updated_at,
      updated_by,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, $8, $9, $10, NOW(), $11, NOW(), $12, 'active')
    RETURNING id
    `,
    [
      data.name,
      data.description,
      data.category_id,
      data.price,
      data.discount_price || 0,
      data.discount_min_qty,
      data.stock_quantity,
      data.weight,
      data.weight_unit,
      data.is_featured,
      userId,
      userId,
    ]
  )

  return Number(rows[0].id)
}

async function createProductWithMultipartUpload(
  client: PoolClient,
  data: ProductCreateInput,
  userId: number,
  validFiles: File[]
) {
  await client.query("BEGIN")

  const { rows } = await client.query(
    `
    INSERT INTO products (
      name,
      description,
      category_id,
      price,
      discount_price,
      discount_min_qty,
      stock_quantity,
      low_stock_threshold,
      cost_price,
      weight,
      weight_unit,
      is_featured,
      created_at,
      created_by,
      updated_at,
      updated_by,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, $8, $9, $10, NOW(), $11, NOW(), $12, 'active')
    RETURNING id
    `,
    [
      data.name,
      data.description,
      data.category_id,
      data.price,
      data.discount_price || 0,
      data.discount_min_qty,
      data.stock_quantity,
      data.weight,
      data.weight_unit,
      data.is_featured,
      userId,
      userId,
    ]
  )

  const id = Number(rows[0].id)
  const uploadedMedia = await uploadProductMediaFiles(id, validFiles)

  if (uploadedMedia.length > 0) {
    const values: unknown[] = []
    const rowsSql = uploadedMedia.map((m, index) => {
      const base = index * 4
      values.push(id, m.url, index === 0, m.media_type)
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
    })

    await client.query(
      `
      INSERT INTO product_images (product_id, image_url, is_primary, media_type)
      VALUES ${rowsSql.join(", ")}
      `,
      values
    )
  }

  await client.query("COMMIT")
  return id
}

export async function POST(req: Request) {
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

    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      const body = await req.json()
      const data = parseProductFields(body)
      const validationError = validateProductCreateInput(data)

      if (validationError) {
        return NextResponse.json({ success: false, message: validationError }, { status: 400 })
      }

      const id = await insertProduct(data, session.user_id)

      const assetIds = Array.isArray(body.media_asset_ids)
        ? body.media_asset_ids
            .map((v: unknown) => Number(v))
            .filter((n: number) => Number.isFinite(n) && n > 0)
        : []

      if (assetIds.length < 1) {
        await dbQuery(`DELETE FROM products WHERE id = $1`, [id]).catch(() => undefined)
        return NextResponse.json(
          { success: false, message: "Select at least one item from the media library." },
          { status: 400 }
        )
      }

      try {
        await linkProductMediaAssets(id, assetIds)
      } catch (linkErr) {
        await dbQuery(`DELETE FROM products WHERE id = $1`, [id]).catch(() => undefined)
        throw linkErr
      }

      return NextResponse.json({
        success: true,
        id,
        message: "Successfully added product to system",
      })
    }

    const formData = await req.formData()
    const files = formData.getAll("images") as File[]
    const data = parseProductFields({
      name: formData.get("name"),
      description: formData.get("description"),
      category_id: formData.get("category_id"),
      price: formData.get("price"),
      discount_price: formData.get("discount_price"),
      discount_min_qty: formData.get("discount_min_qty"),
      stock_quantity: formData.get("stock_quantity"),
      weight: formData.get("weight"),
      weight_unit: formData.get("weight_unit"),
      is_featured: formData.get("is_featured"),
    })

    const validationError = validateProductCreateInput(data)
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 })
    }

    const validFiles = getValidProductMediaFiles(files)
    if (validFiles.length < 1) {
      return NextResponse.json(
        { success: false, message: "Select at least 1 media file" },
        { status: 400 }
      )
    }

    if (validFiles.length > MAX_PRODUCT_MEDIA_COUNT) {
      return NextResponse.json(
        {
          success: false,
          message: `Select up to ${MAX_PRODUCT_MEDIA_COUNT} media files`,
        },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      const id = await createProductWithMultipartUpload(
        client,
        data,
        session.user_id,
        validFiles
      )

      return NextResponse.json({
        message: "Successfully added product to system",
        success: true,
        id,
      })
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined)
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Error Adding Product to System", err)

    const { message, status } = databaseErrorResponse(err, "Could not add product")

    return NextResponse.json(
      {
        message: productApiErrorMessage(err, message),
        success: false,
      },
      { status }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    let query = `SELECT * FROM products`
    const values: unknown[] = []

    if (search) {
      query += ` WHERE name ILIKE $1`
      values.push(`%${search}%`)
    }

    const res = await dbQuery(query, values)

    return NextResponse.json({
      message: "Products succesfully fetched from database",
      data: res.rows,
      success: true,
    })
  } catch (err) {
    console.error("Error Fetching Data from Database", err)
    return NextResponse.json({
      message: "Error Fetching Products from Database",
      success: false,
    })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      )
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      )
    }

    const data = await req.json()
    const weightUnit = String(data.weight_unit ?? "kg")

    if (!isValidProductWeightUnit(weightUnit)) {
      return NextResponse.json(
        { success: false, message: "Weight unit must be kg or cbm" },
        { status: 400 }
      )
    }

    const discountMinQty =
      data.discount_min_qty === null || data.discount_min_qty === undefined || data.discount_min_qty === ""
        ? null
        : Number(data.discount_min_qty)

    const { rows } = await dbQuery(
      `
      UPDATE products 
      SET 
        name = $1, 
        description = $2, 
        category_id = $3, 
        price = $4, 
        stock_quantity = $5, 
        weight = $6, 
        weight_unit = $7,
        is_featured = $8, 
        updated_at = NOW(), 
        updated_by = $9, 
        discount_price = $10, 
        discount_min_qty = $11
      WHERE id = $12
      RETURNING *
      `,
      [
        data.name,
        data.description,
        data.category_id,
        data.price,
        data.stock_quantity,
        data.weight,
        weightUnit,
        data.is_featured,
        session.user_id,
        Number(data.discount_price ?? 0),
        discountMinQty,
        data.id,
      ]
    )

    return NextResponse.json({
      message: "Product succesfully Updated",
      data: rows,
      success: true,
    })
  } catch (err) {
    console.error("Error updating product", err)
    const { message, status } = databaseErrorResponse(err, "Could not update product")
    return NextResponse.json({ success: false, message }, { status })
  }
}
