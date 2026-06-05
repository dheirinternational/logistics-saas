import { dbQuery } from "@/lib/db/db"
import type { PoolClient } from "pg"
import {
  inferMediaTypeFromPath,
  isValidMediaStoragePath,
  parseStorageUrl,
} from "@/lib/media/parseStorageUrl"
import type { AdminMediaItem } from "@/lib/media/adminMedia"

export type MediaAssetRow = {
  id: number
  created_at: string
  storage_bucket: string
  storage_path: string
  public_url: string
  media_type: "image" | "video"
  file_name: string
  size_bytes: number
}

/** node-pg returns bigint columns as strings; normalize for comparisons and API. */
export function normalizeMediaAssetRow(row: MediaAssetRow & { id: number | string }): MediaAssetRow {
  return {
    ...row,
    id: Number(row.id),
    size_bytes: Number(row.size_bytes ?? 0),
  }
}

export function mapMediaAssetRowToAdminItem(row: MediaAssetRow): AdminMediaItem {
  return {
    id: Number(row.id),
    name: row.file_name || row.storage_path.split("/").pop() || "media",
    path: row.storage_path,
    publicUrl: row.public_url,
    mediaType: row.media_type === "video" ? "video" : "photo",
    sizeBytes: Number(row.size_bytes ?? 0),
    updatedAt: row.created_at ?? null,
  }
}

/** All registered assets (library + legacy product/package/shipment uploads). */
export async function listAdminMediaAssets(): Promise<AdminMediaItem[]> {
  const { rows } = await dbQuery<MediaAssetRow>(
    `
    SELECT id, created_at, storage_bucket, storage_path, public_url, media_type, file_name, size_bytes
    FROM media_assets
    WHERE storage_path ~* '\.(jpg|jpeg|png|webp|gif|heic|heif|avif|mp4|mov|webm|m4v|mkv)$'
    ORDER BY created_at DESC
    LIMIT 1000
    `
  )
  return rows.map((row) => mapMediaAssetRowToAdminItem(normalizeMediaAssetRow(row)))
}

/** @deprecated Use listAdminMediaAssets — picker and vault share the full catalog. */
export async function listLibraryMediaAssets(): Promise<AdminMediaItem[]> {
  return listAdminMediaAssets()
}

export async function getMediaAssetsByIds(ids: number[]): Promise<MediaAssetRow[]> {
  const unique = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))]
  if (unique.length === 0) return []

  const { rows } = await dbQuery<MediaAssetRow>(
    `
    SELECT id, created_at, storage_bucket, storage_path, public_url, media_type, file_name, size_bytes
    FROM media_assets
    WHERE id = ANY($1::bigint[])
    `,
    [unique]
  )
  return rows.map((row) => normalizeMediaAssetRow(row))
}

async function getMediaAssetsByIdsWithClient(
  client: PoolClient,
  ids: number[]
): Promise<MediaAssetRow[]> {
  const unique = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))]
  if (unique.length === 0) return []

  const { rows } = await client.query<MediaAssetRow>(
    `
    SELECT id, created_at, storage_bucket, storage_path, public_url, media_type, file_name, size_bytes
    FROM media_assets
    WHERE id = ANY($1::bigint[])
    `,
    [unique]
  )
  return rows.map((row) => normalizeMediaAssetRow(row))
}

export async function insertMediaAsset(input: {
  storage_bucket: string
  storage_path: string
  public_url: string
  media_type: "image" | "video"
  file_name: string
  size_bytes: number
  created_by?: number | null
}): Promise<MediaAssetRow> {
  const { rows } = await dbQuery<MediaAssetRow>(
    `
    INSERT INTO media_assets (
      storage_bucket, storage_path, public_url, media_type, file_name, size_bytes, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (storage_bucket, storage_path) DO UPDATE
      SET public_url = EXCLUDED.public_url,
          media_type = EXCLUDED.media_type,
          file_name = EXCLUDED.file_name,
          size_bytes = EXCLUDED.size_bytes
    RETURNING id, created_at, storage_bucket, storage_path, public_url, media_type, file_name, size_bytes
    `,
    [
      input.storage_bucket,
      input.storage_path,
      input.public_url,
      input.media_type,
      input.file_name,
      input.size_bytes,
      input.created_by ?? null,
    ]
  )
  return normalizeMediaAssetRow(rows[0])
}

export async function countMediaAssetReferences(assetId: number): Promise<number> {
  const { rows } = await dbQuery<{ total: number }>(
    `
    SELECT (
      (SELECT COUNT(*)::int FROM product_images WHERE media_asset_id = $1) +
      (SELECT COUNT(*)::int FROM package_images WHERE media_asset_id = $1) +
      (SELECT COUNT(*)::int FROM shipment_images WHERE media_asset_id = $1)
    ) AS total
    `,
    [assetId]
  )
  return Number(rows[0]?.total ?? 0)
}

export async function deleteMediaAssetByPath(
  storage_bucket: string,
  storage_path: string
): Promise<MediaAssetRow | null> {
  const { rows } = await dbQuery<MediaAssetRow>(
    `
    DELETE FROM media_assets
    WHERE storage_bucket = $1 AND storage_path = $2
    RETURNING id, created_at, storage_bucket, storage_path, public_url, media_type, file_name, size_bytes
    `,
    [storage_bucket, storage_path]
  )
  return rows[0] ?? null
}

export async function getMediaAssetByPath(
  storage_bucket: string,
  storage_path: string
): Promise<MediaAssetRow | null> {
  const { rows } = await dbQuery<MediaAssetRow>(
    `
    SELECT id, created_at, storage_bucket, storage_path, public_url, media_type, file_name, size_bytes
    FROM media_assets
    WHERE storage_bucket = $1 AND storage_path = $2
    LIMIT 1
    `,
    [storage_bucket, storage_path]
  )
  return rows[0] ?? null
}

export async function upsertMediaAssetFromPublicUrl(
  publicUrl: string,
  opts?: { file_name?: string; size_bytes?: number; created_by?: number | null }
): Promise<MediaAssetRow | null> {
  const parsed = parseStorageUrl(publicUrl)
  if (!parsed) return null

  const mediaType = inferMediaTypeFromPath(parsed.path)
  if (!mediaType) return null

  return insertMediaAsset({
    storage_bucket: parsed.bucket,
    storage_path: parsed.path,
    public_url: publicUrl,
    media_type: mediaType,
    file_name: opts?.file_name ?? decodeURIComponent(parsed.path.split("/").pop() ?? "media"),
    size_bytes: opts?.size_bytes ?? 0,
    created_by: opts?.created_by ?? null,
  })
}

async function linkAssetsToTable(
  client: PoolClient,
  table: "product_images" | "package_images" | "shipment_images",
  entityColumn: "product_id" | "package_id" | "shipment_id",
  entityId: number,
  assetIds: number[],
  opts?: { maxCount?: number }
) {
  const uniqueIds = [...new Set(assetIds.map((id) => Number(id)).filter((id) => id > 0))]
  const assets = await getMediaAssetsByIdsWithClient(client, uniqueIds)
  if (assets.length !== uniqueIds.length) {
    throw new Error("One or more selected media items were not found.")
  }

  const order = uniqueIds
    .map((id) => assets.find((a) => Number(a.id) === id))
    .filter((a): a is MediaAssetRow => Boolean(a))

  if (order.length === 0) {
    throw new Error("One or more selected media items were not found.")
  }

  const statsRes = await client.query(
    `SELECT COUNT(*)::int AS count, EXISTS(
       SELECT 1 FROM ${table} WHERE ${entityColumn} = $1 AND is_primary = true
     ) AS has_primary FROM ${table} WHERE ${entityColumn} = $1`,
    [entityId]
  )
  const existing = Number(statsRes.rows[0]?.count ?? 0)
  const max = opts?.maxCount
  if (max != null && existing + order.length > max) {
    throw new Error(`Cannot attach more than ${max} media items.`)
  }

  let hasPrimary = statsRes.rows[0]?.has_primary ?? false

  const values: unknown[] = []
  const rowsSql = order.map((asset, i) => {
    const isPrimary = !hasPrimary && i === 0
    if (isPrimary) hasPrimary = true
    const base = i * 5
    values.push(entityId, asset.public_url, isPrimary, asset.media_type, Number(asset.id))
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
  })

  await client.query(
    `INSERT INTO ${table} (${entityColumn}, image_url, is_primary, media_type, media_asset_id)
     VALUES ${rowsSql.join(", ")}`,
    values,
  )
}

export function linkMediaAssetsToProduct(
  client: PoolClient,
  productId: number,
  assetIds: number[],
  maxCount?: number
) {
  return linkAssetsToTable(client, "product_images", "product_id", productId, assetIds, {
    maxCount,
  })
}

export function linkMediaAssetsToPackage(
  client: PoolClient,
  packageId: number,
  assetIds: number[],
  maxCount?: number
) {
  return linkAssetsToTable(client, "package_images", "package_id", packageId, assetIds, {
    maxCount,
  })
}

export function linkMediaAssetsToShipment(
  client: PoolClient,
  shipmentId: number,
  assetIds: number[],
  maxCount?: number
) {
  return linkAssetsToTable(client, "shipment_images", "shipment_id", shipmentId, assetIds, {
    maxCount,
  })
}

export async function linkMediaAssetsToProductWithPool(
  productId: number,
  assetIds: number[],
  maxCount?: number
) {
  const { pool } = await import("@/lib/db/db")
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await linkMediaAssetsToProduct(client, productId, assetIds, maxCount)
    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined)
    throw err
  } finally {
    client.release()
  }
}
