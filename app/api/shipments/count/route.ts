import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden", success: false }, { status: 403 })
    }

    const { rows } = await dbQuery<{
      total_active: number
      processing: number
      shipped: number
      in_transit: number
      delivered: number
    }>(`
      SELECT
        COUNT(*) FILTER (WHERE status != 'delivered')::int AS total_active,
        COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
        COUNT(*) FILTER (WHERE status = 'shipped')::int    AS shipped,
        COUNT(*) FILTER (WHERE status = 'in_transit')::int AS in_transit,
        COUNT(*) FILTER (WHERE status = 'delivered')::int  AS delivered
      FROM shipments
    `)

    return NextResponse.json({
      success: true,
      message: "Active Shipment Count successfully retrieved",
      data: {
        total_active_count: rows[0].total_active,
        processing: rows[0].processing,
        shipped: rows[0].shipped,
        in_transit: rows[0].in_transit,
        delivered: rows[0].delivered,
      },
    })
  } catch (err) {
    console.error("Internal Server Error", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
