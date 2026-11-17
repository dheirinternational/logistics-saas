import { DatabaseUnavailableError } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { getPortalDashboardData } from "@/lib/portal/dashboard"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await getPortalDashboardData(session.user_id)

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error("customer/dashboard error", err)
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    )
  }
}
