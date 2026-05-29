const BUCKETS = ["products", "packages", "shipments"] as const

export type StorageBucket = (typeof BUCKETS)[number]

export function parseStorageUrl(url: string): { bucket: StorageBucket; path: string } | null {
  for (const bucket of BUCKETS) {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = url.indexOf(marker)
    if (idx === -1) continue
    const path = url.slice(idx + marker.length).split("?")[0]?.trim()
    if (!path) return null
    return { bucket, path }
  }
  return null
}

export function inferMediaTypeFromPath(path: string): "image" | "video" {
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  if (["mp4", "mov", "webm", "m4v", "mkv"].includes(ext)) return "video"
  return "image"
}
