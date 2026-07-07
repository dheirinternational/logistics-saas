import { apiErrorMessage, parseJsonResponse } from "@/lib/api/parseJsonResponse"
import {
  MAX_PRODUCT_MEDIA_FILE_BYTES,
  MAX_PRODUCT_MEDIA_FILE_LABEL,
} from "@/lib/products/productMediaLimits"
import type { AdminMediaItem } from "./adminMedia"

/** Pause between sequential uploads to avoid storage rate limits. */
export const MEDIA_UPLOAD_DELAY_MS = 800

export const MEDIA_UPLOAD_MAX_BATCH = 30

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  m4v: "video/x-m4v",
  mkv: "video/x-matroska",
}

function resolveContentType(file: File): string {
  const raw = (file.type || "").toLowerCase().trim()
  if (raw.startsWith("image/") || raw.startsWith("video/")) return raw
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  return EXTENSION_CONTENT_TYPE[ext] ?? "application/octet-stream"
}

export function validateAdminMediaFile(file: File): string | null {
  if (file.size === 0) {
    return `"${file.name}" is empty.`
  }
  if (file.size > MAX_PRODUCT_MEDIA_FILE_BYTES) {
    return `"${file.name}" is too large (max ${MAX_PRODUCT_MEDIA_FILE_LABEL} per file).`
  }
  return null
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Upload a file using signed URLs so the browser sends the file directly to
 * Supabase Storage, bypassing the Vercel serverless function body limit.
 *
 * Flow:
 *   1. POST /api/admin/media/signed-url → get a signed upload URL
 *   2. PUT file directly to Supabase via the signed URL
 *   3. POST /api/admin/media (JSON) → register the asset in the database
 */
export async function uploadAdminMediaFile(
  file: File,
): Promise<{ ok: boolean; message: string; asset?: AdminMediaItem }> {
  const contentType = resolveContentType(file)

  // Step 1 — ask our API for a signed upload URL (tiny JSON request)
  const urlRes = await fetch("/api/admin/media/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      fileName: file.name,
      contentType,
      sizeBytes: file.size,
    }),
  })

  const urlResult = await parseJsonResponse(urlRes)
  if (!urlRes.ok) {
    return { ok: false, message: apiErrorMessage(urlResult, "Could not prepare upload") }
  }

  const { signedUrl, storagePath, publicUrl, mediaType, bucket } = urlResult as {
    signedUrl: string
    storagePath: string
    publicUrl: string
    mediaType: "image" | "video"
    bucket: string
  }

  // Step 2 — upload file directly from the browser to Supabase Storage
  let uploadRes: Response
  try {
    uploadRes = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    })
  } catch (networkErr) {
    return {
      ok: false,
      message: "Network error during upload. Check your connection and try again.",
    }
  }

  if (!uploadRes.ok) {
    const detail = await uploadRes.text().catch(() => "")
    let reason = `Storage upload failed (${uploadRes.status}).`
    if (detail) {
      try {
        const parsed = JSON.parse(detail)
        if (parsed.message || parsed.error) {
          reason = String(parsed.message ?? parsed.error)
        }
      } catch {
        // non-JSON error body, use the generic message
      }
    }
    return { ok: false, message: reason }
  }

  // Step 3 — register the asset in our database (tiny JSON request)
  const regRes = await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      storagePath,
      publicUrl,
      mediaType,
      fileName: file.name,
      sizeBytes: file.size,
      bucket,
    }),
  })

  const regResult = await parseJsonResponse(regRes)
  if (!regRes.ok) {
    return {
      ok: false,
      message: apiErrorMessage(regResult, "File uploaded but registration failed. Try refreshing."),
    }
  }

  const assetData = regResult.data as { id: number; path: string; publicUrl: string; mediaType: "photo" | "video" }
  const asset: AdminMediaItem = {
    id: assetData.id,
    name: file.name,
    path: assetData.path,
    publicUrl: assetData.publicUrl,
    mediaType: assetData.mediaType,
    sizeBytes: file.size,
    updatedAt: new Date().toISOString(),
  }

  return { ok: true, message: String(regResult.message ?? "Uploaded"), asset }
}
