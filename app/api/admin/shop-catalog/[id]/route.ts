import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession()
    if ("error" in auth) return auth.error

    const { id } = await params
    const catalogId = Number(id)
    if (!Number.isFinite(catalogId) || catalogId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid catalog id" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const updates: string[] = []
    const values: unknown[] = []

    if (typeof body.title === "string") {
      if (!body.title.trim()) {
        return NextResponse.json(
          { success: false, message: "Title cannot be empty" },
          { status: 400 }
        )
      }
      values.push(body.title.trim())
      updates.push(`title = $${values.length}`)
    }

    if (typeof body.description === "string") {
      values.push(body.description.trim())
      updates.push(`description = $${values.length}`)
    }

    if (typeof body.image_alt === "string") {
      values.push(body.image_alt.trim())
      updates.push(`image_alt = $${values.length}`)
    }

    if (body.category_id === null || typeof body.category_id === "number") {
      values.push(body.category_id)
      updates.push(`category_id = $${values.length}`)
    }

    if (typeof body.sort_order === "number") {
      values.push(body.sort_order)
      updates.push(`sort_order = $${values.length}`)
    }

    if (typeof body.is_active === "boolean") {
      values.push(body.is_active)
      updates.push(`is_active = $${values.length}`)
    }

    if (body.media_asset_id === null) {
      values.push(null)
      updates.push(`media_asset_id = $${values.length}`)
    } else if (typeof body.media_asset_id === "number") {
      const mediaRes = await pool.query(
        `SELECT public_url, media_type FROM media_assets WHERE id = $1 LIMIT 1`,
        [body.media_asset_id]
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
      values.push(body.media_asset_id)
      updates.push(`media_asset_id = $${values.length}`)
      values.push(mediaRes.rows[0].public_url)
      updates.push(`image_url = $${values.length}`)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: "No changes provided" },
        { status: 400 }
      )
    }

    updates.push("updated_at = NOW()")
    values.push(catalogId)

    const result = await pool.query(
      `
      UPDATE shop_catalog
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING id
      `,
      values
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Catalog item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Catalog item updated",
    })
  } catch (err) {
    console.error("Admin shop catalog update failed:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession()
    if ("error" in auth) return auth.error

    const { id } = await params
    const catalogId = Number(id)
    if (!Number.isFinite(catalogId) || catalogId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid catalog id" },
        { status: 400 }
      )
    }

    const result = await pool.query(`DELETE FROM shop_catalog WHERE id = $1 RETURNING id`, [
      catalogId,
    ])

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Catalog item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Catalog item removed",
    })
  } catch (err) {
    console.error("Admin shop catalog delete failed:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
