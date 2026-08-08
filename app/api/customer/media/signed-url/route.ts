export const runtime = "nodejs"

import { DatabaseUnavailableError } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import {
  MAX_PRODUCT_MEDIA_FILE_BYTES,
  MAX_PRODUCT_MEDIA_FILE_LABEL,
} from "@/lib/products/productMediaLimits"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

const CUSTOMER_BUCKET = "products"

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
])

export async function POST(req: Request) {
  try {
    let session
    try {
      session = await getSession()
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) throw err
      throw err
    }

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    if (!body?.fileName || !body?.contentType || !body?.sizeBytes) {
      return NextResponse.json(
        { success: false, message: "Missing fileName, contentType, or sizeBytes." },
        { status: 400 }
      )
    }

    const { fileName, contentType: rawCt, sizeBytes } = body as {
      fileName: string
      contentType: string
      sizeBytes: number
    }

    if (sizeBytes > MAX_PRODUCT_MEDIA_FILE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `File is too large. Max ${MAX_PRODUCT_MEDIA_FILE_LABEL} per file.`,
        },
        { status: 400 }
      )
    }

    const contentType = rawCt.toLowerCase().trim()
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return NextResponse.json(
        { success: false, message: "Unsupported file type. Please upload a JPG, PNG, or WEBP photo." },
        { status: 400 }
      )
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase()
    const storagePath = `customer_procurement/${session.user_id}/${Date.now()}_${safeName}`

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage
      .from(CUSTOMER_BUCKET)
      .createSignedUploadUrl(storagePath)

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          message: `Could not create upload URL: ${error?.message ?? "unknown error"}`,
        },
        { status: 500 }
      )
    }

    const { data: pubData } = supabase.storage
      .from(CUSTOMER_BUCKET)
      .getPublicUrl(storagePath)

    return NextResponse.json({
      success: true,
      data: {
        signedUrl: data.signedUrl,
        storagePath,
        publicUrl: pubData.publicUrl,
        bucket: CUSTOMER_BUCKET,
      },
    })
  } catch (err) {
    console.error("Error creating customer signed upload URL", err)
    return NextResponse.json(
      { success: false, message: "Could not prepare image upload" },
      { status: 500 }
    )
  }
}
