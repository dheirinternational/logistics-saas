import { fileExtension } from "@/lib/media/parseStorageUrl"
import { randomUUID } from "crypto"

export type AdminMediaItem = {
  id: number
  name: string
  path: string
  publicUrl: string
  mediaType: "photo" | "video"
  sizeBytes: number
  updatedAt: string | null
}

type SupabaseListEntry = {
  id?: string | null
  name: string
  updated_at?: string | null
  metadata?: {
    mimetype?: string
    size?: number
  } | null
}

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "avif"])
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v", "mkv"])

function sanitizeFileName(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_")
  return (base || "media").slice(0, 120)
}

function inferMediaType(name: string, mimetype?: string): "photo" | "video" | null {
  const type = (mimetype || "").toLowerCase().trim()
  if (type.startsWith("image/")) return "photo"
  if (type.startsWith("video/")) return "video"

  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (IMAGE_EXTENSIONS.has(ext)) return "photo"
  if (VIDEO_EXTENSIONS.has(ext)) return "video"
  return null
}

const DEFAULT_EXT: Record<"image" | "video", string> = {
  image: "jpg",
  video: "mp4",
}

/** Storage path with a guaranteed file extension so DB list/prune logic keeps the asset. */
export function buildMediaLibraryPath(fileName: string, mediaType: "image" | "video") {
  const sanitized = sanitizeFileName(fileName)
  const withExt = fileExtension(sanitized)
    ? sanitized
    : `${sanitized.replace(/\.+$/, "") || "media"}.${DEFAULT_EXT[mediaType]}`
  return `media-library/${Date.now()}-${randomUUID()}-${withExt}`
}

export function mapSupabaseObjectToMediaItem(
  object: SupabaseListEntry,
  publicUrl: string
): AdminMediaItem | null {
  const mediaType = inferMediaType(object.name, object.metadata?.mimetype)
  if (!mediaType) return null

  return {
    id: 0,
    name: object.name,
    path: `media-library/${object.name}`,
    publicUrl,
    mediaType,
    sizeBytes: Number(object.metadata?.size ?? 0),
    updatedAt: object.updated_at ?? null,
  }
}
