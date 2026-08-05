import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import {
  deleteShipmentById,
  ShipmentDeleteError,
  shipmentDeleteErrorMessage,
} from "@/lib/shipments/deleteShipment"
import { linkMediaAssetsToShipment } from "@/lib/media/mediaAssets"
import { NextResponse } from "next/server"

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
    const shipmentId = Number(id)
    if (!Number.isFinite(shipmentId)) {
      return NextResponse.json({ success: false, message: "Invalid shipment id" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await deleteShipmentById(client, shipmentId)
      return NextResponse.json({ success: true, message: "Shipment deleted" })
    } finally {
      client.release()
    }
  } catch (err) {
    if (err instanceof ShipmentDeleteError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.status }
      )
    }

    const { message, status } = shipmentDeleteErrorMessage(err)
    if (status >= 500) {
      console.error("Error deleting shipment", err)
    }

    return NextResponse.json({ success: false, message }, { status })
  }
}

/**
 * PUT /api/shipments/[id]
 * Updates shipment details.
 * Editable fields: tracking_number, customer_code, origin_warehouse_id, destination_warehouse_id, channel, total_cost, total_weight, total_weight_unit, payment_time, paid_for, status.
 * Supports updating attached media as well.
 */
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
    const shipmentId = Number(id)
    if (!Number.isFinite(shipmentId)) {
      return NextResponse.json({ success: false, message: "Invalid shipment id" }, { status: 400 })
    }

    const body = await req.json()
    const {
      tracking_number,
      customer_code,
      origin_warehouse_id,
      destination_warehouse_id,
      channel,
      total_cost,
      total_weight,
      total_weight_unit,
      payment_time,
      paid_for,
      status,
      shipment_note,
      admin_reply,
      media_asset_ids,
    } = body

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Fetch existing admin reply & user_id for notification logic
      const existing = await client.query(
        "SELECT admin_reply, tracking_number, user_id FROM shipments WHERE id = $1",
        [shipmentId]
      )
      const oldReply = existing.rows[0]?.admin_reply || ""
      const trackingNo = existing.rows[0]?.tracking_number
      const customerUserId = existing.rows[0]?.user_id

      // Update basic fields
      await client.query(
        `
        UPDATE shipments
        SET
          tracking_number = COALESCE($1, tracking_number),
          customer_code = COALESCE($2, customer_code),
          origin_warehouse_id = COALESCE($3, origin_warehouse_id),
          destination_warehouse_id = COALESCE($4, destination_warehouse_id),
          channel = COALESCE($5, channel),
          total_cost = COALESCE($6, total_cost),
          total_weight = COALESCE($7, total_weight),
          total_weight_unit = COALESCE($8, total_weight_unit),
          payment_time = COALESCE($9, payment_time),
          paid_for = COALESCE($10, paid_for),
          status = COALESCE($11, status),
          shipment_note = COALESCE($12, shipment_note),
          admin_reply = COALESCE($13, admin_reply)
        WHERE id = $14
        `,
        [
          tracking_number || null,
          customer_code || null,
          origin_warehouse_id ? Number(origin_warehouse_id) : null,
          destination_warehouse_id ? Number(destination_warehouse_id) : null,
          channel || null,
          total_cost !== undefined ? Number(total_cost) : null,
          total_weight !== undefined ? Number(total_weight) : null,
          total_weight_unit || null,
          payment_time || null,
          paid_for !== undefined ? Boolean(paid_for) : null,
          status || null,
          shipment_note !== undefined ? shipment_note : null,
          admin_reply !== undefined ? admin_reply : null,
          shipmentId,
        ]
      )

      // Notify customer if admin reply changed
      if (admin_reply !== undefined && admin_reply.trim() !== oldReply.trim() && customerUserId) {
        await client.query(
          `
          INSERT INTO inbox_messages (sender_id, recipient_id, title, body, is_broadcast)
          VALUES ($1, $2, $3, $4, false)
          `,
          [
            session.user_id,
            customerUserId,
            `Shipment Note Update (${trackingNo || tracking_number})`,
            admin_reply.trim(),
          ]
        )
      }

      // Also update media links if array is provided
      if (Array.isArray(media_asset_ids)) {
        // Clear previous associations first to support replacing
        await client.query(
          `DELETE FROM shipment_images WHERE shipment_id = $1`,
          [shipmentId]
        )
        const validIds = media_asset_ids.map(Number).filter((x) => x > 0)
        if (validIds.length > 0) {
          await linkMediaAssetsToShipment(client, shipmentId, validIds)
        }
      }

      await client.query("COMMIT")
      return NextResponse.json({ success: true, message: "Shipment updated successfully" })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Error updating shipment:", err)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
