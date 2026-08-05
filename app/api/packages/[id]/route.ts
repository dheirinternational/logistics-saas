import { databaseErrorResponse, dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import {
  linkPackageMediaAssets,
  parsePackageMediaAssetIds,
} from "@/lib/packages/linkPackageMedia"
import { NextResponse } from "next/server"
import type { DatabaseError } from "pg"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const packageId = Number(id)
    if (!Number.isFinite(packageId)) {
      return NextResponse.json({ success: false, message: "Invalid package id" }, { status: 400 })
    }

    const formData = await req.formData()
    const mediaAssetIds = parsePackageMediaAssetIds(formData.getAll("media_asset_ids"))

    const package_name = String(formData.get("package_name") ?? "").trim()
    const incoming_package_id = String(formData.get("incoming_package_id") ?? "").trim()
    const customer_code = String(formData.get("customer_code") ?? "").trim()
    const warehouse_id = Number(formData.get("warehouse_id"))
    const weight = Number(formData.get("weight"))
    const weight_unit = String(formData.get("weight_unit") ?? "kg")
    const amount = Number(formData.get("amount"))
    const condition = String(formData.get("condition") ?? "good")
    const rawReceivedAt = String(formData.get("received_at") ?? "").trim()
    const rawStoredAt = String(formData.get("stored_at") ?? "").trim()
    const received_at = rawReceivedAt || null
    const stored_at = rawStoredAt || null

    if (!package_name || !incoming_package_id || !customer_code) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (!warehouse_id || !Number.isFinite(warehouse_id) || warehouse_id <= 0) {
      return NextResponse.json({ success: false, message: "Please select a valid warehouse" }, { status: 400 })
    }

    if (!["kg", "cbm"].includes(weight_unit)) {
      return NextResponse.json({ success: false, message: "Invalid weight unit" }, { status: 400 })
    }

    const userResult = await dbQuery<{ user_id: number }>(
      `SELECT user_id FROM customers WHERE code = $1`,
      [customer_code]
    )
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `User with Customer code ${customer_code} was not found` },
        { status: 404 }
      )
    }

    const existingIdentifier = await dbQuery(
      `SELECT id FROM packages WHERE incoming_package_id = $1 AND id <> $2 LIMIT 1`,
      [incoming_package_id, packageId]
    )

    if (existingIdentifier.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Package identifier ${incoming_package_id} already exists. Use a different identifier.`,
        },
        { status: 409 }
      )
    }

    const updateResult = await dbQuery(
      `UPDATE packages
         SET incoming_package_id = $1,
             package_name = $2,
             user_id = $3,
             customer_code = $4,
             warehouse_id = $5,
             weight = $6,
             weight_unit = $7,
             condition = $8,
             received_at = COALESCE($9, received_at),
             stored_at = COALESCE($10, stored_at),
             amount = $11
       WHERE id = $12`,
      [
        incoming_package_id,
        package_name,
        userResult.rows[0].user_id,
        customer_code,
        warehouse_id,
        weight,
        weight_unit,
        condition,
        received_at,
        stored_at,
        amount,
        packageId,
      ]
    )

    if (updateResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 })
    }

    await linkPackageMediaAssets(packageId, mediaAssetIds)

    return NextResponse.json({ success: true, message: "Package updated successfully" })
  } catch (err) {
    const dbError = err as DatabaseError
    if (dbError?.code === "23505" && dbError?.constraint === "packages_incoming_package_id_key") {
      return NextResponse.json(
        {
          success: false,
          message: "Package identifier already exists. Use a different identifier.",
        },
        { status: 409 }
      )
    }
    console.error("Error updating package", err)
    const { message, status } = databaseErrorResponse(err, "Could not update package")
    return NextResponse.json({ success: false, message }, { status })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const packageId = Number(id)

    await dbQuery(`DELETE FROM package_images WHERE package_id = $1`, [packageId])
    const deleteResult = await dbQuery(`DELETE FROM packages WHERE id = $1`, [packageId])

    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Package deleted" })
  } catch (err) {
    const dbError = err as DatabaseError
    if (dbError?.code === "23503") {
      return NextResponse.json(
        {
          success: false,
          message: "This package is linked to other shipment records and cannot be deleted yet.",
        },
        { status: 409 }
      )
    }
    console.error("Error deleting package", err)
    const { message, status } = databaseErrorResponse(err, "Could not delete package")
    return NextResponse.json({ success: false, message }, { status })
  }
}
