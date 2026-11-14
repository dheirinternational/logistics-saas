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

  return res.rowCount ?? 0
}
