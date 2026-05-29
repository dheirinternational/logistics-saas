import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import {
  deleteShipmentById,
  ShipmentDeleteError,
  shipmentDeleteErrorMessage,
} from "@/lib/shipments/deleteShipment"
import { NextResponse } from "next/server"

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
    const shipmentId = Number(id)
    if (!Number.isFinite(shipmentId)) {
      return NextResponse.json({ success: false, message: "Invalid shipment id" }, { status: 400 })
    }

    await deleteShipmentById(client, shipmentId)

    return NextResponse.json({ success: true, message: "Shipment deleted" })
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
  } finally {
    client.release()
  }
}
