import { requireAdminSession } from "@/lib/manualPayments/actions"
import { countAwaitingManualPayments } from "@/lib/manualPayments/service"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdminSession()
    const count = await countAwaitingManualPayments()

    return NextResponse.json({
      success: true,
      data: { count },
    })
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Something went wrong" },
      {
        status:
          err instanceof Error && err.message === "Forbidden" ? 403 : 500,
      }
    )
  }
}
