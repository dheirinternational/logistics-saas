import { isBankTransferEnabled } from "@/lib/bankTransfer/config"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!isBankTransferEnabled()) {
      return NextResponse.json(
        { message: "Bank transfer is not available right now" },
        { status: 503 }
      )
    }

    return NextResponse.json({
      message: "Continue to bank transfer",
      redirect_to: "/customer/payments/transfer/order/new",
    })
  } catch (err) {
    console.error("Bank transfer order init failed:", err)
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Could not start bank transfer checkout",
      },
      { status: 500 }
    )
  }
}
