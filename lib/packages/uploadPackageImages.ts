import {
  linkPackageMediaAssets,
  parsePackageMediaAssetIds,
} from "@/lib/packages/linkPackageMedia"
import type { PoolClient } from "pg"
import { linkMediaAssetsToPackage } from "@/lib/media/mediaAssets"

/** @deprecated Prefer linkPackageMediaAssets — kept for legacy multipart flows using a client. */
export async function linkPackageMediaFromLibrary(
  client: PoolClient,
  packageId: number,
  entries: FormDataEntryValue[]
): Promise<void> {
  const assetIds = parsePackageMediaAssetIds(entries)
  if (assetIds.length === 0) return
  await linkMediaAssetsToPackage(client, packageId, assetIds)
}

export { linkPackageMediaAssets, parsePackageMediaAssetIds }
