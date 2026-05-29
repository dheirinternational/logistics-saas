import { getSupabaseAdmin } from "@/lib/supabase/admin"
import type { SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

export { getSupabaseAdmin }

export function parseProductStoragePath(url: string): string | null {
  const marker = "/storage/v1/object/public/products/"
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

const EXTENSION_MIME: Record<string, string> = {
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

export type ProductMediaUpload = {
  url: string
  media_type: "image" | "video"
}

function sanitizeFileName(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_")
  return (base || "media").slice(0, 120)
}

export function getValidProductMediaFiles(entries: FormDataEntryValue[]) {
  return entries.filter((entry): entry is File => entry instanceof File && entry.size > 0)
}

export function resolveProductMediaType(file: File): {
  media_type: "image" | "video"
  contentType: string
} {
  const rawType = (file.type || "").toLowerCase().trim()
  if (rawType.startsWith("image/")) {
    return { media_type: "image", contentType: rawType }
  }
  if (rawType.startsWith("video/")) {
    return { media_type: "video", contentType: rawType }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  const inferred = EXTENSION_MIME[ext]
  if (!inferred) {
    throw new Error(
      `Unsupported media type for "${file.name}". Use JPG, PNG, WEBP, HEIC, MP4, or MOV.`
    )
  }

  return {
    media_type: inferred.startsWith("video/") ? "video" : "image",
    contentType: inferred,
  }
}

export async function uploadProductMediaFiles(
  productId: number,
  files: File[]
): Promise<ProductMediaUpload[]> {
  const supabase = getSupabaseAdmin()
  const uploaded: ProductMediaUpload[] = []

  for (let i = 0; i < files.length; i++) {
    uploaded.push(
      await uploadOneProductMediaFileWithClient(supabase, productId, files[i], i)
    )
  }

  return uploaded
}

export async function uploadOneProductMediaFile(
  productId: number,
  file: File,
  index = 0
): Promise<ProductMediaUpload> {
  const supabase = getSupabaseAdmin()
  return uploadOneProductMediaFileWithClient(supabase, productId, file, index)
}

async function uploadOneProductMediaFileWithClient(
  supabase: SupabaseClient,
  productId: number,
  file: File,
  index: number
): Promise<ProductMediaUpload> {
    const { media_type, contentType } = resolveProductMediaType(file)
    const filePath = `product${productId}-${Date.now()}-${index}-${randomUUID()}-${sanitizeFileName(file.name)}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage.from("products").upload(filePath, buffer, {
      contentType,
      upsert: false,
    })

    if (error) {
      throw new Error(`Media upload failed for "${file.name}": ${error.message}`)
    }

    const { data: publicUrl } = supabase.storage.from("products").getPublicUrl(filePath)
    return { url: publicUrl.publicUrl, media_type }
}
