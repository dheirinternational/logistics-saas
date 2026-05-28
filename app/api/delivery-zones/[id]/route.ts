import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
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
    await pool.query(`DELETE FROM delivery_zones WHERE id = $1`, [id])

    return NextResponse.json({ success: true, message: "Delivery zone deleted" })
  } catch (err) {
    console.error("Error deleting delivery zone", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
