import { apiErrorMessage, parseJsonResponse } from "@/lib/api/parseJsonResponse"
import {
  MAX_PRODUCT_MEDIA_FILE_BYTES,
  MAX_PRODUCT_MEDIA_FILE_LABEL,
} from "@/lib/products/productMediaLimits"

/** Pause between sequential uploads to avoid DB/storage rate limits. */
export const MEDIA_UPLOAD_DELAY_MS = 2_500

export const MEDIA_UPLOAD_MAX_BATCH = 30

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

export async function uploadAdminMediaFile(
  file: File
): Promise<{ ok: boolean; message: string }> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/admin/media", {
    method: "POST",
    body: formData,
    credentials: "include",
  })

  const result = await parseJsonResponse(res)
  if (!res.ok) {
    return { ok: false, message: apiErrorMessage(result, "Upload failed") }
  }

  return { ok: true, message: String(result.message ?? "Uploaded") }
}
