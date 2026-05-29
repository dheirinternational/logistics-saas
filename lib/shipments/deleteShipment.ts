import { optionalDelete } from "@/lib/db/optionalDelete"
import type { PoolClient } from "pg"
import type { DatabaseError } from "pg"

export function normalizePackageIds(packageIds: number[] | string | null): number[] {
  if (packageIds == null) return []
  if (Array.isArray(packageIds)) {
    return packageIds.map(Number).filter((n) => Number.isFinite(n))
  }
  if (typeof packageIds === "string") {
    return packageIds
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
  }
  return []
}

/**
 * Deletes a shipment and unlinks related rows (images, payments, manual payment proofs).
 * Packages on the shipment are moved back to `stored`.
 */
export async function deleteShipmentById(
  client: PoolClient,
  shipmentId: number
): Promise<{ tracking_number: string }> {
  const shipmentRes = await client.query<{
    id: number
    tracking_number: string
    package_ids: number[] | string | null
  }>(
    `SELECT id, tracking_number, package_ids FROM shipments WHERE id = $1 LIMIT 1`,
    [shipmentId]
  )

  if (shipmentRes.rows.length === 0) {
    throw new ShipmentDeleteError("Shipment not found", 404)
  }

  const { tracking_number, package_ids } = shipmentRes.rows[0]

  await client.query("BEGIN")

  try {
    await client.query(`DELETE FROM shipment_images WHERE shipment_id = $1`, [shipmentId])

    // Manual payment tables may not exist on every environment yet.
    await optionalDelete(
      client,
      `DELETE FROM manual_payment_audit_log
       WHERE submission_id IN (
         SELECT id FROM manual_payment_submissions
         WHERE payment_type = 'shipment'
           AND (
             reference = $1
             OR reference IN (
               SELECT transaction_ref FROM payments
               WHERE shipment_tracking_number = $1
             )
           )
       )`,
      [tracking_number]
    )

    await optionalDelete(
      client,
      `DELETE FROM manual_payment_submissions
       WHERE payment_type = 'shipment'
         AND (
           reference = $1
           OR reference IN (
             SELECT transaction_ref FROM payments
             WHERE shipment_tracking_number = $1
           )
         )`,
      [tracking_number]
    )

    await client.query(`DELETE FROM payments WHERE shipment_tracking_number = $1`, [
      tracking_number,
    ])

    const packageIdList = normalizePackageIds(package_ids)
    if (packageIdList.length > 0) {
      await client.query(`UPDATE packages SET status = 'stored' WHERE id = ANY($1::int[])`, [
        packageIdList,
      ])
    }

    const deleteResult = await client.query(`DELETE FROM shipments WHERE id = $1`, [shipmentId])

    if (deleteResult.rowCount === 0) {
      throw new ShipmentDeleteError("Shipment not found", 404)
    }

    await client.query("COMMIT")
    return { tracking_number }
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined)
    throw err
  }
}

export class ShipmentDeleteError extends Error {
  constructor(
    message: string,
    readonly status: number = 500
  ) {
    super(message)
    this.name = "ShipmentDeleteError"
  }
}

export function shipmentDeleteErrorMessage(err: unknown): { message: string; status: number } {
  if (err instanceof ShipmentDeleteError) {
    return { message: err.message, status: err.status }
  }

  const dbErr = err as DatabaseError & { detail?: string }

  if (dbErr?.code === "23503") {
    const detail = dbErr.detail ?? ""
    if (detail.includes("payments")) {
      return {
        message:
          "This shipment still has a payment record linked to it. Remove or reassign the payment first, then try again.",
        status: 409,
      }
    }
    if (detail.includes("shipment_images")) {
      return {
        message: "This shipment still has images attached. Try again or contact support.",
        status: 409,
      }
    }
    return {
      message:
        "This shipment is linked to other records and cannot be deleted yet. Check payments or related data first.",
      status: 409,
    }
  }

  if (dbErr?.code === "42P01") {
    return {
      message: "Database schema is out of date for shipment delete. Run pending migrations.",
      status: 500,
    }
  }

  return {
    message: err instanceof Error ? err.message : "Could not delete shipment",
    status: 500,
  }
}
