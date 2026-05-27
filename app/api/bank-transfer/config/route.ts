import { getBankTransferDetails, isBankTransferEnabled } from "@/lib/bankTransfer/config"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!isBankTransferEnabled()) {
      return NextResponse.json(
        { message: "Bank transfer is not available right now" },
        { status: 503 }
      )
    }

    const details = getBankTransferDetails()

    return NextResponse.json({
      success: true,
      data: details,
    })
  } catch (err) {
    console.error("Bank transfer config error:", err)
    return NextResponse.json(
      { message: "Bank transfer is not configured" },
      { status: 503 }
    )
  }
}
