import { getSession } from "@/lib/db/session"
import { getShopSettings, setFreeDeliveryEnabled } from "@/lib/shop/shopSettings"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await getShopSettings()

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (err) {
    console.error("Shop settings fetch failed:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    const { free_delivery_enabled } = await req.json()
    if (typeof free_delivery_enabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "free_delivery_enabled must be a boolean" },
        { status: 400 }
      )
    }

    const settings = await setFreeDeliveryEnabled(
      free_delivery_enabled,
      session.user_id
    )

    return NextResponse.json({
      success: true,
      message: free_delivery_enabled
        ? "Free delivery enabled"
        : "Free delivery disabled",
      data: settings,
    })
  } catch (err) {
    console.error("Shop settings update failed:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
