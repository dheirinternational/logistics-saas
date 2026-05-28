import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

type DatabaseError = { code?: string }

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  let began = false
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const shipmentId = Number(id)
    if (!Number.isFinite(shipmentId)) {
      return NextResponse.json({ success: false, message: "Invalid shipment id" }, { status: 400 })
    }

    const shipmentRes = await client.query<{
      id: number
      tracking_number: string
      package_ids: number[] | string | null
    }>(
      `SELECT id, tracking_number, package_ids FROM shipments WHERE id = $1 LIMIT 1`,
      [shipmentId]
    )

    if (shipmentRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Shipment not found" }, { status: 404 })
    }

    const { tracking_number, package_ids } = shipmentRes.rows[0]

    await client.query("BEGIN")
    began = true

    await client.query(`DELETE FROM shipment_images WHERE shipment_id = $1`, [shipmentId])

    await client.query(
      `DELETE FROM manual_payment_audit_log
       WHERE submission_id IN (
         SELECT mps.id
         FROM manual_payment_submissions mps
         INNER JOIN payments p ON p.transaction_ref = mps.reference
         WHERE mps.payment_type = 'shipment'
           AND p.shipment_tracking_number = $1
       )`,
      [tracking_number]
    )

    await client.query(
      `DELETE FROM manual_payment_submissions
       WHERE payment_type = 'shipment'
         AND reference IN (
           SELECT transaction_ref FROM payments WHERE shipment_tracking_number = $1
         )`,
      [tracking_number]
    )

    await client.query(`DELETE FROM payments WHERE shipment_tracking_number = $1`, [
      tracking_number,
    ])

    const packageIdList = normalizePackageIds(package_ids)
    if (packageIdList.length > 0) {
      await client.query(
        `UPDATE packages SET status = 'stored' WHERE id = ANY($1::int[])`,
        [packageIdList]
      )
    }

    const deleteResult = await client.query(`DELETE FROM shipments WHERE id = $1`, [shipmentId])

    if (deleteResult.rowCount === 0) {
      await client.query("ROLLBACK")
      return NextResponse.json({ success: false, message: "Shipment not found" }, { status: 404 })
    }

    await client.query("COMMIT")

    return NextResponse.json({ success: true, message: "Shipment deleted" })
  } catch (err) {
    if (began) {
      await client.query("ROLLBACK").catch(() => undefined)
    }
    const dbError = err as DatabaseError
    if (dbError?.code === "23503") {
      return NextResponse.json(
        {
          success: false,
          message: "This shipment is linked to other records and cannot be deleted yet.",
        },
        { status: 409 }
      )
    }
    console.error("Error deleting shipment", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  } finally {
    client.release()
  }
}

function normalizePackageIds(packageIds: number[] | string | null): number[] {
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
