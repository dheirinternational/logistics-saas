import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"
import type { DatabaseError } from "pg"

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
