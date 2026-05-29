import type { PoolClient } from "pg"
import { linkMediaAssetsToPackage } from "@/lib/media/mediaAssets"

function parseMediaAssetIds(entries: FormDataEntryValue[]): number[] {
  return entries
    .map((entry) => Number(String(entry)))
    .filter((id) => Number.isFinite(id) && id > 0)
}

/**
 * Links optional package media from the central library (no per-form uploads).
 */
export async function linkPackageMediaFromLibrary(
  client: PoolClient,
  packageId: number,
  entries: FormDataEntryValue[]
): Promise<void> {
  const assetIds = parseMediaAssetIds(entries)
  if (assetIds.length === 0) return
  await linkMediaAssetsToPackage(client, packageId, assetIds)
}
