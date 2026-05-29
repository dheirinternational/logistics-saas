export const runtime = "nodejs"
export const maxDuration = 60

import { databaseErrorResponse, DatabaseUnavailableError } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { buildMediaLibraryPath } from "@/lib/media/adminMedia"
import {
  countMediaAssetReferences,
  deleteMediaAssetByPath,
  insertMediaAsset,
  listAdminMediaAssets,
} from "@/lib/media/mediaAssets"
import { syncAllMediaAssets } from "@/lib/media/syncMediaAssets"
import {
  MAX_PRODUCT_MEDIA_FILE_BYTES,
  MAX_PRODUCT_MEDIA_FILE_LABEL,
} from "@/lib/products/productMediaLimits"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { resolveProductMediaType } from "@/lib/products/uploadProductMedia"
import { NextResponse } from "next/server"

const LIBRARY_BUCKET = "products"

async function requireAdminSession() {
  let session
  try {
    session = await getSession()
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      throw err
    }
    throw err
  }

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }),
    }
  }

  if (session.role !== "admin") {
    return {
      ok: false as const,
      response: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }),
    }
  }

  return { ok: true as const, session }
}

export async function GET(req: Request) {
  try {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response

    const url = new URL(req.url)
    const runSync = url.searchParams.get("sync") === "1"

    const sync = runSync
      ? await syncAllMediaAssets({ pruneInvalid: true })
      : null
    const items = await listAdminMediaAssets()

    return NextResponse.json({
      success: true,
      data: items,
      sync: sync
        ? {
            imported: sync.fromStorage + sync.fromUrls,
            linksUpdated: sync.linksUpdated,
            pruned: sync.pruned,
          }
        : null,
    })
  } catch (err) {
    const { message, status } = databaseErrorResponse(err, "Could not load media")
    return NextResponse.json({ success: false, message }, { status })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response

    const ct = (req.headers.get("content-type") ?? "").toLowerCase()
    if (ct.includes("application/json")) {
      return registerUploadedAsset(req, auth.session.user_id)
    }
    return proxyUpload(req, auth.session.user_id)
  } catch (err) {
    const { message, status } = databaseErrorResponse(err, "Could not upload media")
    return NextResponse.json({ success: false, message }, { status })
  }
}

/**
 * Register a file that was already uploaded directly to Supabase via a signed URL.
 * Expects JSON: { storagePath, publicUrl, mediaType, fileName, sizeBytes, bucket? }
 */
async function registerUploadedAsset(req: Request, userId: number) {
  const body = await req.json().catch(() => null)
  if (!body?.storagePath || !body?.publicUrl || !body?.mediaType || !body?.fileName) {
    return NextResponse.json(
      { success: false, message: "Missing required fields for asset registration." },
      { status: 400 },
    )
  }

  const { storagePath, publicUrl, mediaType, fileName, sizeBytes, bucket } = body as {
    storagePath: string
    publicUrl: string
    mediaType: "image" | "video"
    fileName: string
    sizeBytes: number
    bucket?: string
  }

  if (mediaType !== "image" && mediaType !== "video") {
    return NextResponse.json(
      { success: false, message: "mediaType must be 'image' or 'video'." },
      { status: 400 },
    )
  }

  const asset = await insertMediaAsset({
    storage_bucket: bucket || LIBRARY_BUCKET,
    storage_path: storagePath,
    public_url: publicUrl,
    media_type: mediaType,
    file_name: fileName,
    size_bytes: Number(sizeBytes) || 0,
    created_by: userId,
  })

  return NextResponse.json({
    success: true,
    message: "Media uploaded successfully.",
    data: {
      id: asset.id,
      path: storagePath,
      publicUrl: asset.public_url,
      mediaType: asset.media_type === "video" ? "video" : "photo",
    },
  })
}

/** Legacy flow: file is proxied through the serverless function to Supabase. */
async function proxyUpload(req: Request, userId: number) {
  const formData = await req.formData()
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { success: false, message: "Select one file to upload." },
      { status: 400 }
    )
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

  let media_type: "image" | "video"
  let contentType: string
  try {
    ;({ media_type, contentType } = resolveProductMediaType(file))
  } catch (typeErr) {
    return NextResponse.json(
      {
        success: false,
        message:
          typeErr instanceof Error
            ? typeErr.message
            : "Unsupported file type. Use JPG, PNG, WEBP, MP4, or MOV.",
      },
      { status: 400 }
    )
  }
  const path = buildMediaLibraryPath(file.name, media_type)
  const buffer = Buffer.from(await file.arrayBuffer())
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(LIBRARY_BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  })

  if (error) {
    return NextResponse.json(
      { success: false, message: `Upload failed: ${error.message}` },
      { status: 500 }
    )
  }

  const { data: pub } = supabase.storage.from(LIBRARY_BUCKET).getPublicUrl(path)

  let asset
  try {
    asset = await insertMediaAsset({
      storage_bucket: LIBRARY_BUCKET,
      storage_path: path,
      public_url: pub.publicUrl,
      media_type,
      file_name: file.name,
      size_bytes: file.size,
      created_by: userId,
    })
  } catch (dbErr) {
    await supabase.storage.from(LIBRARY_BUCKET).remove([path]).catch(() => undefined)
    throw dbErr
  }

  return NextResponse.json({
    success: true,
    message: "Media uploaded successfully.",
    data: {
      id: asset.id,
      path,
      publicUrl: asset.public_url,
      mediaType: asset.media_type === "video" ? "video" : "photo",
    },
  })
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response

    const body = await req.json().catch(() => ({}))
    const assetId = Number(body.id)
    const path = String(body.path ?? "")

    const { dbQuery } = await import("@/lib/db/db")
    type AssetRef = { id: number; storage_bucket: string; storage_path: string }

    let asset: AssetRef | undefined

    if (Number.isFinite(assetId) && assetId > 0) {
      const { rows } = await dbQuery<AssetRef>(
        `SELECT id, storage_bucket, storage_path FROM media_assets WHERE id = $1`,
        [assetId]
      )
      asset = rows[0]
    } else if (path) {
      const { rows } = await dbQuery<AssetRef>(
        `SELECT id, storage_bucket, storage_path FROM media_assets WHERE storage_path = $1 LIMIT 1`,
        [path]
      )
      asset = rows[0]
    }

    if (!asset) {
      return NextResponse.json({ success: false, message: "Media not found." }, { status: 404 })
    }

    const refs = await countMediaAssetReferences(asset.id)
    if (refs > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `This file is used on ${refs} product, package, or shipment record(s). Remove those links first.`,
        },
        { status: 409 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.storage.from(asset.storage_bucket).remove([asset.storage_path])

    if (error) {
      return NextResponse.json(
        { success: false, message: `Delete failed: ${error.message}` },
        { status: 500 }
      )
    }

    await deleteMediaAssetByPath(asset.storage_bucket, asset.storage_path)

    return NextResponse.json({
      success: true,
      message: "Media deleted.",
    })
  } catch (err) {
    const { message, status } = databaseErrorResponse(err, "Could not delete media")
    return NextResponse.json({ success: false, message }, { status })
  }
}
