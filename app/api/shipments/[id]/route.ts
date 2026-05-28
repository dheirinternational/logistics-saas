import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
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

    await client.query("BEGIN")
    await client.query(`DELETE FROM shipment_images WHERE shipment_id = $1`, [id])
    await client.query(`DELETE FROM payments WHERE shipment_id = $1`, [id])
    await client.query(`DELETE FROM shipments WHERE id = $1`, [id])
    await client.query("COMMIT")

    return NextResponse.json({ success: true, message: "Shipment deleted" })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Error deleting shipment", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  } finally {
    client.release()
  }
}
