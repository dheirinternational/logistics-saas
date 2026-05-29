export const runtime = "nodejs"

import { databaseErrorResponse, DatabaseUnavailableError } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { buildMediaLibraryPath } from "@/lib/media/adminMedia"
import {
  MAX_PRODUCT_MEDIA_FILE_BYTES,
  MAX_PRODUCT_MEDIA_FILE_LABEL,
} from "@/lib/products/productMediaLimits"
import { getSupabaseAdmin } from "@/lib/products/uploadProductMedia"
import { NextResponse } from "next/server"

const LIBRARY_BUCKET = "products"

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
])
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/x-matroska",
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
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body?.fileName || !body?.contentType || !body?.sizeBytes) {
      return NextResponse.json(
        { success: false, message: "Missing fileName, contentType, or sizeBytes." },
        { status: 400 },
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
        { status: 400 },
      )
    }

    const contentType = rawCt.toLowerCase().trim()
    let mediaType: "image" | "video"
    if (ALLOWED_IMAGE_TYPES.has(contentType)) {
      mediaType = "image"
    } else if (ALLOWED_VIDEO_TYPES.has(contentType)) {
      mediaType = "video"
    } else {
      return NextResponse.json(
        { success: false, message: "Unsupported file type. Use JPG, PNG, WEBP, MP4, or MOV." },
        { status: 400 },
      )
    }

    const storagePath = buildMediaLibraryPath(fileName, mediaType)
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.storage
      .from(LIBRARY_BUCKET)
      .createSignedUploadUrl(storagePath)

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          message: `Could not create upload URL: ${error?.message ?? "unknown error"}`,
        },
        { status: 500 },
      )
    }

    const { data: pub } = supabase.storage.from(LIBRARY_BUCKET).getPublicUrl(storagePath)

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      storagePath,
      publicUrl: pub.publicUrl,
      contentType,
      mediaType,
      bucket: LIBRARY_BUCKET,
    })
  } catch (err) {
    const { message, status } = databaseErrorResponse(err, "Could not create upload URL")
    return NextResponse.json({ success: false, message }, { status })
  }
}
