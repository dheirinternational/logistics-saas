import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
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

function parseStoragePathFromPublicUrl(url: string): string | null {
  // Expected: .../storage/v1/object/public/products/<path>
  const marker = "/storage/v1/object/public/products/"
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}


export async function GET(req: Request, { params }: {params: Promise<{id: string}>}){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                messgae: "Unauthorized"
            }, {status: 401})
        }

        const { id } = await params

        const res = await pool.query(`
            SELECT id, created_at, product_id, image_url, is_primary, media_type
            FROM product_images
            WHERE product_id = $1
            ORDER BY is_primary DESC, id ASC
        `, [id])

        return NextResponse.json({
            message: "Products Images succesfully fetched from database",
            data: res.rows,
            success: true
        })
    
    }
    catch(err){
        console.error("Error Fetching Product Images", err)
        return NextResponse.json({
            message: "Error Fetching Product Images",
            success: false
        },{status: 500})
    }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const formData = await req.formData()
    const files = formData.getAll("media") as File[]
    const validFiles = files.filter((f) => f instanceof File && f.size > 0)

    if (validFiles.length < 1) {
      return NextResponse.json(
        { success: false, message: "Select at least 1 media file" },
        { status: 400 }
      )
    }

    if (validFiles.length > 8) {
      return NextResponse.json(
        { success: false, message: "Select up to 8 media files" },
        { status: 400 }
      )
    }

    await client.query("BEGIN")

    // If product has no primary media yet, first upload becomes primary.
    const primaryRes = await client.query(
      `SELECT id FROM product_images WHERE product_id = $1 AND is_primary = true LIMIT 1`,
      [id]
    )
    const hasPrimary = (primaryRes.rowCount ?? 0) > 0

    const uploaded: { url: string; media_type: "image" | "video"; is_primary: boolean }[] =
      []

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      if (!isImage && !isVideo) {
        throw new Error("Unsupported media type")
      }

      const filePath = `product${id}-${Date.now()}-${file.name}`
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error } = await supabase.storage.from("products").upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })
      if (error) throw new Error(`Supabase upload failed: ${error.message}`)

      const { data: publicUrl } = supabase.storage.from("products").getPublicUrl(filePath)
      const makePrimary = !hasPrimary && i === 0
      uploaded.push({
        url: publicUrl.publicUrl,
        media_type: isVideo ? "video" : "image",
        is_primary: makePrimary,
      })
    }

    const values: unknown[] = []
    const rowsSql = uploaded.map((m, index) => {
      const base = index * 4
      values.push(id, m.url, m.is_primary, m.media_type)
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
    })

    await client.query(
      `
      INSERT INTO product_images (product_id, image_url, is_primary, media_type)
      VALUES ${rowsSql.join(", ")}
      `,
      values
    )

    await client.query("COMMIT")
    return NextResponse.json({ success: true, message: "Media uploaded" })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Error uploading product media:", err)
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
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

    await client.query("BEGIN")
    await client.query(`UPDATE product_images SET is_primary = false WHERE product_id = $1`, [
      productId,
    ])
    const res = await client.query(
      `UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2`,
      [imageId, productId]
    )
    await client.query("COMMIT")

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Media not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Cover updated" })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Error setting product cover:", err)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
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

    await client.query("BEGIN")
    const imgRes = await client.query(
      `SELECT id, image_url, is_primary FROM product_images WHERE id = $1 AND product_id = $2 FOR UPDATE`,
      [imageId, productId]
    )
    if (imgRes.rowCount === 0) {
      await client.query("ROLLBACK")
      return NextResponse.json({ success: false, message: "Media not found" }, { status: 404 })
    }

    const row = imgRes.rows[0] as { image_url: string; is_primary: boolean }

    await client.query(`DELETE FROM product_images WHERE id = $1 AND product_id = $2`, [
      imageId,
      productId,
    ])

    if (row.is_primary) {
      // Promote next media (if any) to primary.
      await client.query(
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

    await client.query("COMMIT")

    const storagePath = parseStoragePathFromPublicUrl(row.image_url)
    if (storagePath) {
      const { error } = await supabase.storage.from("products").remove([storagePath])
      if (error) {
        console.error("Supabase media delete failed:", error)
      }
    }

    return NextResponse.json({ success: true, message: "Media removed" })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Error deleting product media:", err)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}