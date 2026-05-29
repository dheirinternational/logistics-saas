import { dbQuery } from "@/lib/db/db"
import { getMediaAssetsByIds } from "@/lib/media/mediaAssets"
import { MAX_PRODUCT_MEDIA_COUNT } from "@/lib/products/productMediaLimits"

/** Link library assets to a product — no pool.connect(); safe with PG_POOL_MAX=1. */
export async function linkProductMediaAssets(
  productId: number,
  assetIds: number[],
  maxCount = MAX_PRODUCT_MEDIA_COUNT
): Promise<void> {
  const uniqueIds = [...new Set(assetIds.map((id) => Number(id)).filter((id) => id > 0))]
  if (uniqueIds.length === 0) {
    throw new Error("Select at least one item from the media library.")
  }

  const assets = await getMediaAssetsByIds(uniqueIds)
  if (assets.length !== uniqueIds.length) {
    throw new Error("One or more selected media items were not found.")
  }

  const order = uniqueIds
    .map((id) => assets.find((a) => Number(a.id) === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))

  if (order.length === 0) {
    throw new Error("One or more selected media items were not found.")
  }

  const countRes = await dbQuery<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM product_images WHERE product_id = $1`,
    [productId]
  )
  const existing = Number(countRes.rows[0]?.count ?? 0)
  if (existing + order.length > maxCount) {
    throw new Error(`This product can have at most ${maxCount} media items.`)
  }

  const primaryRes = await dbQuery(
    `SELECT 1 FROM product_images WHERE product_id = $1 AND is_primary = true LIMIT 1`,
    [productId]
  )
  let hasPrimary = (primaryRes.rowCount ?? 0) > 0

  const values: unknown[] = []
  const rowsSql = order.map((asset, index) => {
    const isPrimary = !hasPrimary && index === 0
    if (isPrimary) hasPrimary = true
    const base = index * 5
    values.push(productId, asset.public_url, isPrimary, asset.media_type, Number(asset.id))
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
  })

  if (rowsSql.length === 0) {
    throw new Error("Could not link media to product.")
  }

  await dbQuery(
    `
    INSERT INTO product_images (product_id, image_url, is_primary, media_type, media_asset_id)
    VALUES ${rowsSql.join(", ")}
    `,
    values
  )
}
