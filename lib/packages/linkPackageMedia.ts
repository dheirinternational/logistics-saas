import { dbQuery } from "@/lib/db/db"
import { getMediaAssetsByIds } from "@/lib/media/mediaAssets"

export function parsePackageMediaAssetIds(
  entries: FormDataEntryValue[] | number[]
): number[] {
  if (entries.length === 0) return []
  if (typeof entries[0] === "number") {
    return [...new Set((entries as number[]).map((id) => Number(id)).filter((id) => id > 0))]
  }
  return [
    ...new Set(
      (entries as FormDataEntryValue[])
        .map((entry) => Number(String(entry)))
        .filter((id) => Number.isFinite(id) && id > 0)
    ),
  ]
}

/** Link library media to a package — uses dbQuery only (PG_POOL_MAX=1 safe). */
export async function linkPackageMediaAssets(
  packageId: number,
  assetIds: number[]
): Promise<void> {
  const uniqueIds = parsePackageMediaAssetIds(assetIds)
  if (uniqueIds.length === 0) return

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

  const statsRes = await dbQuery<{ has_primary: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM package_images WHERE package_id = $1 AND is_primary = true
     ) AS has_primary`,
    [packageId]
  )
  let hasPrimary = statsRes.rows[0]?.has_primary ?? false

  const values: unknown[] = []
  const rowsSql = order.map((asset, index) => {
    const isPrimary = !hasPrimary && index === 0
    if (isPrimary) hasPrimary = true
    const base = index * 5
    values.push(packageId, asset.public_url, isPrimary, asset.media_type, Number(asset.id))
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
  })

  if (rowsSql.length === 0) {
    throw new Error("Could not link media to package.")
  }

  await dbQuery(
    `
    INSERT INTO package_images (package_id, image_url, is_primary, media_type, media_asset_id)
    VALUES ${rowsSql.join(", ")}
    `,
    values
  )
}
