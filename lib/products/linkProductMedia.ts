import { dbQuery } from "@/lib/db/db"
import { getMediaAssetsByIds, type MediaAssetRow } from "@/lib/media/mediaAssets"
import { MAX_PRODUCT_MEDIA_COUNT } from "@/lib/products/productMediaLimits"

/**
 * Link library assets to a product.
 * Accepts optional pre-fetched assets to avoid a duplicate DB round-trip
 * when the caller already validated them.
 */
export async function linkProductMediaAssets(
  productId: number,
  assetIds: number[],
  opts?: { maxCount?: number; prefetchedAssets?: MediaAssetRow[] },
): Promise<void> {
  const maxCount = opts?.maxCount ?? MAX_PRODUCT_MEDIA_COUNT
  const uniqueIds = [...new Set(assetIds.map((id) => Number(id)).filter((id) => id > 0))]
  if (uniqueIds.length === 0) {
    throw new Error("Select at least one item from the media library.")
  }

  const assets = opts?.prefetchedAssets ?? await getMediaAssetsByIds(uniqueIds)
  if (assets.length !== uniqueIds.length) {
    throw new Error("One or more selected media items were not found.")
  }

  const order = uniqueIds
    .map((id) => assets.find((a) => Number(a.id) === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))

  if (order.length === 0) {
    throw new Error("One or more selected media items were not found.")
  }

  const statsRes = await dbQuery<{ count: number; has_primary: boolean }>(
    `SELECT COUNT(*)::int AS count, EXISTS(
       SELECT 1 FROM product_images WHERE product_id = $1 AND is_primary = true
     ) AS has_primary FROM product_images WHERE product_id = $1`,
    [productId],
  )
  const existing = Number(statsRes.rows[0]?.count ?? 0)
  const hasPrimary = statsRes.rows[0]?.has_primary ?? false

  if (existing + order.length > maxCount) {
    throw new Error(`This product can have at most ${maxCount} media items.`)
  }

  let primaryAssigned = hasPrimary
  const values: unknown[] = []
  const rowsSql = order.map((asset, index) => {
    const isPrimary = !primaryAssigned && index === 0
    if (isPrimary) primaryAssigned = true
    const base = index * 5
    values.push(productId, asset.public_url, isPrimary, asset.media_type, Number(asset.id))
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
  })

  await dbQuery(
    `INSERT INTO product_images (product_id, image_url, is_primary, media_type, media_asset_id)
     VALUES ${rowsSql.join(", ")}`,
    values,
  )
}
