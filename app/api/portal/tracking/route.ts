import { getPortalTrackingData } from "@/lib/portal/tracking"
import type { PortalTrackingFilter } from "@/lib/portal/tracking"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

const FILTERS: PortalTrackingFilter[] = ["active", "delivered", "all"]

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      )
    }

    const raw = req.nextUrl.searchParams.get("filter") ?? "active"
    const filter = FILTERS.includes(raw as PortalTrackingFilter)
      ? (raw as PortalTrackingFilter)
      : "active"

    const data = await getPortalTrackingData(session.user_id, filter)

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("GET /api/portal/tracking", err)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    )
  }
}
