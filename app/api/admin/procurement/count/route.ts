import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { rows } = await dbQuery<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM procurement_requests WHERE status IN ('submitted', 'under_review');`
    )

    const pendingCount = Number(rows[0]?.count ?? 0)

    return NextResponse.json({
      success: true,
      data: { count: pendingCount },
    })
  } catch (err) {
    console.error("Error fetching procurement count", err)
    return NextResponse.json({ success: false, message: "Could not fetch count" }, { status: 500 })
  }
}
