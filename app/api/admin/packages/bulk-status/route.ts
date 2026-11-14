import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

const ALLOWED_PACKAGE_STATUSES = new Set([
  "stored",
  "requested_for",
  "assigned_to_shipment",
  "delivered",
])

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const json = await req.json()
    const rawIds: unknown[] = Array.isArray(json?.ids) ? json.ids : []
    const ids = rawIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
    const status = typeof json?.status === "string" ? json.status.trim() : ""

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Select at least one package" },
        { status: 400 },
      )
    }

    if (!ALLOWED_PACKAGE_STATUSES.has(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid package status" },
        { status: 400 },
      )
    }

    const result = await dbQuery<{ id: number }>(
      `UPDATE packages SET status = $1 WHERE id = ANY($2::bigint[]) RETURNING id`,
      [status, ids],
    )

    return NextResponse.json({
      success: true,
      message: `${result.rowCount ?? 0} package(s) updated to ${status.replaceAll("_", " ")}.`,
      data: {
        updatedCount: result.rowCount ?? 0,
        status,
      },
    })
  } catch (err) {
    console.error("POST /api/admin/packages/bulk-status error:", err)
    return NextResponse.json({ success: false, message: "Could not update packages" }, { status: 500 })
  }
}
