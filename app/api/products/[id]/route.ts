import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { deleteProductById } from "@/lib/products/deleteProduct"
import { productApiErrorMessage } from "@/lib/products/productApiErrors"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          messgae: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const { id } = await params

    const [productRes, imagesRes] = await Promise.all([
      pool.query(`SELECT * FROM products WHERE id = $1`, [id]),
      pool.query(
        `
                SELECT id, created_at, product_id, image_url, is_primary, media_type
                FROM product_images
                WHERE product_id = $1
                ORDER BY is_primary DESC, id ASC
                `,
        [id]
      ),
    ])

    const product = productRes.rows[0]
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Products succesfully fetched from database",
      data: { ...product, images: imagesRes.rows },
      success: true,
    })
  } catch (err) {
    console.error("Error Fetching Data from Database", err)
    return NextResponse.json(
      {
        message: "Error Fetching Products from Database",
        success: false,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
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

    await deleteProductById(productId)

    return NextResponse.json({ success: true, message: "Product deleted" })
  } catch (err) {
    console.error("Error deleting product", err)
    return NextResponse.json(
      {
        success: false,
        message: productApiErrorMessage(err, "Could not delete product"),
      },
      { status: 500 }
    )
  }
}
