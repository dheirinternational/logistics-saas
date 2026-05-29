import { dbQuery } from "@/lib/db/db"
import { inferMediaTypeFromPath, isValidMediaStoragePath } from "@/lib/media/parseStorageUrl"
import { insertMediaAsset, upsertMediaAssetFromPublicUrl } from "@/lib/media/mediaAssets"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

type StorageBucket = "products" | "packages" | "shipments"

const STORAGE_PREFIXES: { bucket: StorageBucket; prefix: string }[] = [
  { bucket: "products", prefix: "media-library" },
  { bucket: "packages", prefix: "" },
  { bucket: "shipments", prefix: "" },
]

type ListEntry = {
  name: string
  id?: string | null
  updated_at?: string | null
  metadata?: { mimetype?: string; size?: number } | null
}

function isLikelyFolder(entry: ListEntry, fullPath: string) {
  if (entry.id == null && entry.metadata == null) return true
  if (!isValidMediaStoragePath(fullPath)) return true
  if (entry.metadata?.size === 0 && !inferMediaTypeFromPath(fullPath)) return true
  return false
}

async function listStorageObjects(bucket: StorageBucket, prefix: string) {
  const supabase = getSupabaseAdmin()
  const collected: { path: string; entry: ListEntry }[] = []
  const limit = 1000
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "updated_at", order: "desc" },
    })

    if (error) {
      throw new Error(`Storage list failed (${bucket}/${prefix || "root"}): ${error.message}`)
    }

    const batch = data ?? []
    if (batch.length === 0) break

    for (const entry of batch) {
      if (!entry.name) continue
      const path = prefix ? `${prefix}/${entry.name}` : entry.name
      if (isLikelyFolder(entry, path)) continue
      const mediaType = inferMediaTypeFromPath(path)
      if (!mediaType) continue
      collected.push({ path, entry })
    }

    if (batch.length < limit) break
    offset += limit
    if (offset > 10_000) break
  }

  return collected
}

export async function syncMediaAssetsFromStorage(): Promise<number> {
  let imported = 0
  const supabase = getSupabaseAdmin()

  for (const { bucket, prefix } of STORAGE_PREFIXES) {
    const objects = await listStorageObjects(bucket, prefix)

    for (const { path, entry } of objects) {
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
      await insertMediaAsset({
        storage_bucket: bucket,
        storage_path: path,
        public_url: pub.publicUrl,
        media_type: inferMediaTypeFromPath(path) ?? "image",
        file_name: decodeURIComponent(path.split("/").pop() ?? "media"),
        size_bytes: Number(entry.metadata?.size ?? 0),
        created_by: null,
      })
      imported += 1
    }
  }

  return imported
}

export async function syncMediaAssetsFromAttachmentUrls(): Promise<number> {
  const { rows } = await dbQuery<{ image_url: string }>(
    `
    SELECT DISTINCT image_url
    FROM (
      SELECT image_url FROM product_images
      UNION ALL
      SELECT image_url FROM package_images
      UNION ALL
      SELECT image_url FROM shipment_images
    ) urls
    WHERE image_url IS NOT NULL AND length(trim(image_url)) > 0
    `
  )

  let imported = 0
  for (const row of rows) {
    const asset = await upsertMediaAssetFromPublicUrl(row.image_url)
    if (asset) imported += 1
  }

  return imported
}

/** Link attachment rows that have URLs but no media_asset_id yet. */
export async function linkOrphanedAttachmentMedia(): Promise<number> {
  const tables = [
    {
      name: "product_images",
      entity: "product_id",
    },
    {
      name: "package_images",
      entity: "package_id",
    },
    {
      name: "shipment_images",
      entity: "shipment_id",
    },
  ] as const

  let linked = 0

  for (const table of tables) {
    const { rows } = await dbQuery<{ id: number; image_url: string; asset_id: number }>(
      `
      UPDATE ${table.name} AS t
      SET media_asset_id = ma.id
      FROM media_assets AS ma
      WHERE t.media_asset_id IS NULL
        AND t.image_url = ma.public_url
      RETURNING t.id, t.image_url, ma.id AS asset_id
      `
    )
    linked += rows.length
  }

  return linked
}

export type MediaSyncResult = {
  fromStorage: number
  fromUrls: number
  linksUpdated: number
  pruned: number
}

/** Remove folder placeholders and other non-file rows mistaken for media. */
export async function pruneInvalidMediaAssets(): Promise<number> {
  const { rows } = await dbQuery<{ id: number }>(
    `
    DELETE FROM media_assets
    WHERE NOT (
      storage_path ~* '\.(jpg|jpeg|png|webp|gif|heic|heif|avif|mp4|mov|webm|m4v|mkv)$'
    )
    RETURNING id
    `
  )
  return rows.length
}

export async function syncAllMediaAssets(opts?: {
  pruneInvalid?: boolean
}): Promise<MediaSyncResult> {
  const fromUrls = await syncMediaAssetsFromAttachmentUrls()
  const fromStorage = await syncMediaAssetsFromStorage()
  const pruned = opts?.pruneInvalid ? await pruneInvalidMediaAssets() : 0
  const linksUpdated = await linkOrphanedAttachmentMedia()

  return { fromStorage, fromUrls, linksUpdated, pruned }
}
