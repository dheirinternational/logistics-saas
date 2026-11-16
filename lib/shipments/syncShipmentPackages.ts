import { dbQuery } from "@/lib/db/db"
import type { Pool, PoolClient } from "pg"

export function parseShipmentPackageIds(raw: unknown): number[] {
  if (raw == null) return []
  if (Array.isArray(raw)) {
    return raw.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
  }
  if (typeof raw === "string") {
    return raw
      .replace(/[{}]/g, "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
  }
  return []
}

/**
 * Keeps paired incoming_packages rows aligned when packages move to or from `delivered`
 * so already-delivered tracking numbers do not stay marked `stored`.
 */
export async function syncIncomingPackagesForPackageIds(
  packageIds: number[],
  packageStatus: string | null | undefined,
  executor?: Pool | PoolClient,
): Promise<void> {
  if (packageIds.length === 0 || !packageStatus) return

  const nextIncomingStatus = packageStatus === "delivered" ? "delivered" : "stored"
  const sql = `UPDATE incoming_packages i
     SET status = $1
     FROM packages p
     WHERE p.id = ANY($2::bigint[])
       AND i.incoming_tracking_number = p.incoming_package_id
       AND i.user_id = p.user_id
       AND i.status <> 'expected'
       AND i.status IS DISTINCT FROM $1`
  const params = [nextIncomingStatus, packageIds]

  if (executor) {
    await executor.query(sql, params)
  } else {
    await dbQuery(sql, params)
  }
}

/**
 * Synchronizes package statuses inside a shipment whenever the shipment status changes.
 * Delivered shipments move all included packages to `delivered`; non-delivered shipments keep them `assigned_to_shipment`.
 */
export async function syncPackagesForShipmentStatus(
  executor: Pool | PoolClient,
  packageIdsRaw: unknown,
  shipmentStatus: string | null | undefined,
): Promise<number> {
  const ids = parseShipmentPackageIds(packageIdsRaw)
  if (ids.length === 0 || !shipmentStatus) return 0

  const nextPackageStatus =
    shipmentStatus === "delivered" ? "delivered" : "assigned_to_shipment"

  const res = await executor.query(
    `UPDATE packages
     SET status = $1
     WHERE id = ANY($2::bigint[])
       AND status IS DISTINCT FROM $1`,
    [nextPackageStatus, ids],
  )

  await syncIncomingPackagesForPackageIds(ids, nextPackageStatus, executor)

  return res.rowCount ?? 0
}
