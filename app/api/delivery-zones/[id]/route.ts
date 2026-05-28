import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function PATCH(
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
    const zoneId = Number(id)
    if (!Number.isFinite(zoneId) || zoneId < 1) {
      return NextResponse.json({ success: false, message: "Invalid zone id" }, { status: 400 })
    }

    const body = await req.json()
    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Enter a valid delivery fee" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `
      UPDATE delivery_zones
      SET price = $1
      WHERE id = $2
      RETURNING id, state_id, price
      `,
      [price, zoneId]
    )

    if ((result.rowCount ?? 0) < 1) {
      return NextResponse.json(
        { success: false, message: "Delivery zone not found" },
        { status: 404 }
      )
    }

    const stateRes = await pool.query(`SELECT name FROM states WHERE id = $1`, [
      result.rows[0].state_id,
    ])

    return NextResponse.json({
      success: true,
      message: "Delivery fee updated",
      data: {
        ...result.rows[0],
        state_name: stateRes.rows[0]?.name ?? null,
      },
    })
  } catch (err) {
    console.error("Error updating delivery zone", err)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
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
    await pool.query(`DELETE FROM delivery_zones WHERE id = $1`, [id])

    return NextResponse.json({ success: true, message: "Delivery zone deleted" })
  } catch (err) {
    console.error("Error deleting delivery zone", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
