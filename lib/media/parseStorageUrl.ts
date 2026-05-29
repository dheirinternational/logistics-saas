const BUCKETS = ["products", "packages", "shipments"] as const

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
  "avif",
])

const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v", "mkv"])

export type StorageBucket = (typeof BUCKETS)[number]

export function fileExtension(path: string): string {
  const base = path.split("/").pop() ?? path
  const dot = base.lastIndexOf(".")
  if (dot <= 0) return ""
  return base.slice(dot + 1).toLowerCase()
}

export function isValidMediaStoragePath(path: string): boolean {
  const ext = fileExtension(path)
  return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext)
}

export function inferMediaTypeFromPath(path: string): "image" | "video" | null {
  const ext = fileExtension(path)
  if (VIDEO_EXTENSIONS.has(ext)) return "video"
  if (IMAGE_EXTENSIONS.has(ext)) return "image"
  return null
}

export function parseStorageUrl(url: string): { bucket: StorageBucket; path: string } | null {
  for (const bucket of BUCKETS) {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = url.indexOf(marker)
    if (idx === -1) continue
    const path = decodeURIComponent(url.slice(idx + marker.length).split("?")[0]?.trim() ?? "")
    if (!path || !isValidMediaStoragePath(path)) return null
    return { bucket, path }
  }
  return null
}
