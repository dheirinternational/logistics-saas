import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { uploadPackageImages } from "@/lib/packages/uploadPackageImages"
import { NextResponse } from "next/server"
import type { DatabaseError } from "pg"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
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
    const imageEntries = formData.getAll("images")

    const package_name = String(formData.get("package_name") ?? "").trim()
    const incoming_package_id = String(formData.get("incoming_package_id") ?? "").trim()
    const customer_code = String(formData.get("customer_code") ?? "").trim()
    const warehouse_id = Number(formData.get("warehouse_id"))
    const weight = Number(formData.get("weight"))
    const weight_unit = String(formData.get("weight_unit") ?? "kg")
    const amount = Number(formData.get("amount"))
    const condition = String(formData.get("condition") ?? "good")
    const received_at = String(formData.get("received_at") ?? "")
    const stored_at = String(formData.get("stored_at") ?? "")

    if (!package_name || !incoming_package_id || !customer_code) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (!["kg", "cbm"].includes(weight_unit)) {
      return NextResponse.json({ success: false, message: "Invalid weight unit" }, { status: 400 })
    }

    await client.query("BEGIN")

    const userResult = await client.query(`SELECT user_id FROM customers WHERE code = $1`, [customer_code])
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK")
      return NextResponse.json({ success: false, message: `User with Customer code ${customer_code} was not found` }, { status: 404 })
    }

    const existingIdentifier = await client.query(
      `SELECT id FROM packages WHERE incoming_package_id = $1 AND id <> $2 LIMIT 1`,
      [incoming_package_id, packageId]
    )

    if (existingIdentifier.rows.length > 0) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        {
          success: false,
          message: `Package identifier ${incoming_package_id} already exists. Use a different identifier.`,
        },
        { status: 409 }
      )
    }

    const updateResult = await client.query(
      `UPDATE packages
         SET incoming_package_id = $1,
             package_name = $2,
             user_id = $3,
             customer_code = $4,
             warehouse_id = $5,
             weight = $6,
             weight_unit = $7,
             condition = $8,
             received_at = $9,
             stored_at = $10,
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
      await client.query("ROLLBACK")
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 })
    }

    await uploadPackageImages(client, packageId, imageEntries)

    await client.query("COMMIT")
    return NextResponse.json({ success: true, message: "Package updated successfully" })
  } catch (err) {
    await client.query("ROLLBACK")
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
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    await client.query("BEGIN")
    await client.query(`DELETE FROM package_images WHERE package_id = $1`, [id])
    const deleteResult = await client.query(`DELETE FROM packages WHERE id = $1`, [id])
    await client.query("COMMIT")

    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Package deleted" })
  } catch (err) {
    await client.query("ROLLBACK")
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
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  } finally {
    client.release()
  }
}
