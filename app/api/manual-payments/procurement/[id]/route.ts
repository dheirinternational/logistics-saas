import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { getActiveSubmissionForReference } from "@/lib/manualPayments/service"
import { submitManualPaymentProof } from "@/lib/manualPayments/actions"
import type { ManualPaymentSubmission } from "@/lib/manualPayments/types"
import { pool } from "@/lib/db/db"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/manual-payments/procurement/[id]
 * Fetch procurement details and transfer submission context for bank transfer proof upload.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const requestId = Number(id)

    const typeParam = req.nextUrl.searchParams.get("type") || "commitment"
    const pType = typeParam === "quote" ? "procurement_quote" : "procurement_commitment"

    const reqRes = await dbQuery(
      `
      SELECT id, reference_number, title, commitment_fee, commitment_fee_paid, quote_total, status, user_id
      FROM procurement_requests
      WHERE (id = $1 OR reference_number = $2) AND user_id = $3
      `,
      [Number.isNaN(requestId) ? 0 : requestId, id, session.user_id]
    )

    if (reqRes.rows.length === 0) {
      return NextResponse.json({ message: "Procurement request not found" }, { status: 404 })
    }

    const pr = reqRes.rows[0]
    const amount = pType === "procurement_quote" ? Number(pr.quote_total || 0) : Number(pr.commitment_fee || 20000)

    const client = await pool.connect()
    let activeSub: ManualPaymentSubmission | null = null
    try {
      activeSub = await getActiveSubmissionForReference(client, pType, pr.reference_number)
    } finally {
      client.release()
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentType: pType,
        reference: pr.reference_number,
        amount,
        label: pType === "procurement_quote" ? `Procurement Quotation Settlement (${pr.reference_number})` : `Procurement Commitment Fee (${pr.reference_number})`,
        status: pType === "procurement_quote" ? pr.status : pr.commitment_fee_paid ? "paid" : "pending",
        latestSubmission: activeSub
          ? {
              id: activeSub.id,
              status: activeSub.status,
              created_at: activeSub.created_at,
              admin_note: activeSub.admin_note,
            }
          : null,
      },
    })
  } catch (err) {
    console.error("Procurement manual payment GET error:", err)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const requestId = Number(id)
    const typeParam = req.nextUrl.searchParams.get("type") || "commitment"
    const pType = typeParam === "quote" ? "procurement_quote" : "procurement_commitment"

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

    const reqRes = await dbQuery(
      `
      SELECT id, reference_number, commitment_fee, quote_total
      FROM procurement_requests
      WHERE (id = $1 OR reference_number = $2) AND user_id = $3
      `,
      [Number.isNaN(requestId) ? 0 : requestId, id, session.user_id]
    )

    if (reqRes.rows.length === 0) {
      return NextResponse.json({ message: "Procurement request not found" }, { status: 404 })
    }

    const pr = reqRes.rows[0]

    const result = await submitManualPaymentProof({
      paymentType: pType as any,
      reference: pr.reference_number,
      userId: session.user_id,
      amount,
      transferReference,
      customerNote,
      receiptFile: receipt,
    })

    return NextResponse.json({
      success: true,
      message: "Transfer proof submitted. We will confirm once received.",
      submission_id: result.submissionId,
      redirect_to: `/customer/procurement`,
    })
  } catch (err) {
    console.error("Procurement manual payment POST error:", err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Could not submit transfer proof" },
      { status: 500 }
    )
  }
}
