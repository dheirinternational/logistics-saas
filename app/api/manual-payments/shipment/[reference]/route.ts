import { isBankTransferEnabled } from "@/lib/bankTransfer/config"
import {
  getManualPaymentContextForUser,
  requireCustomerSession,
  submitManualPaymentProof,
} from "@/lib/manualPayments/actions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const session = await requireCustomerSession()
    const { reference } = await params

    const context = await getManualPaymentContextForUser(
      "shipment",
      reference,
      session.user_id
    )

    if (!context) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: context })
  } catch (err) {
    console.error("Manual payment context error:", err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Something went wrong" },
      { status: err instanceof Error && err.message === "Unauthorized" ? 401 : 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    if (!isBankTransferEnabled()) {
      return NextResponse.json(
        { message: "Bank transfer is not available right now" },
        { status: 503 }
      )
    }

    const session = await requireCustomerSession()
    const { reference } = await params
    const formData = await req.formData()

    const receipt = formData.get("receipt") as File | null
    const transferReference = String(formData.get("transfer_reference") ?? "")
    const customerNote = String(formData.get("customer_note") ?? "")
    const amount = Number(formData.get("amount"))

    if (!receipt) {
      return NextResponse.json({ message: "Receipt is required" }, { status: 400 })
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    const context = await getManualPaymentContextForUser(
      "shipment",
      reference,
      session.user_id
    )

    if (!context) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    if (Math.abs(context.amount - amount) > 0.009) {
      return NextResponse.json(
        { message: "Amount does not match the payment due" },
        { status: 400 }
      )
    }

    const result = await submitManualPaymentProof({
      paymentType: "shipment",
      reference,
      userId: session.user_id,
      amount: context.amount,
      transferReference,
      customerNote,
      receiptFile: receipt,
    })

    return NextResponse.json({
      message: "Transfer proof submitted. We will confirm once received.",
      submission_id: result.submissionId,
      redirect_to: `/customer/pending_payments?transfer=submitted&reference=${encodeURIComponent(
        reference
      )}`,
    })
  } catch (err) {
    console.error("Manual shipment payment submit failed:", err)
    const message = err instanceof Error ? err.message : "Could not submit transfer proof"
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("already") || message.includes("cannot")
          ? 400
          : 500

    return NextResponse.json({ message }, { status })
  }
}
