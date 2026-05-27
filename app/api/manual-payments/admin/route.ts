import { requireAdminSession } from "@/lib/manualPayments/actions"
import { createReceiptSignedUrl } from "@/lib/manualPayments/storage"
import { listManualPaymentSubmissionsPaged } from "@/lib/manualPayments/service"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()

    const status =
      req.nextUrl.searchParams.get("status") ?? "awaiting_confirmation"

    const page = Number(req.nextUrl.searchParams.get("page") ?? "1")
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? "20")

    const result = await listManualPaymentSubmissionsPaged({
      status,
      page,
      pageSize,
    })

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
      },
    })
  } catch (err) {
    console.error("Admin manual payments list error:", err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Something went wrong" },
      {
        status:
          err instanceof Error && err.message === "Forbidden" ? 403 : 500,
      }
    )
  }
}
