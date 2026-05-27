import { pool } from "@/lib/db/db"
import { requireAdminSession } from "@/lib/manualPayments/actions"
import { createReceiptSignedUrl } from "@/lib/manualPayments/storage"
import {
  confirmManualPaymentSubmission,
  rejectManualPaymentSubmission,
} from "@/lib/manualPayments/service"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession()
    const { id } = await params
    const submissionId = Number(id)

    if (!Number.isFinite(submissionId)) {
      return NextResponse.json({ message: "Invalid submission id" }, { status: 400 })
    }

    const res = await pool.query(
      `
      SELECT receipt_storage_path
      FROM manual_payment_submissions
      WHERE id = $1
      LIMIT 1
      `,
      [submissionId]
    )

    if (res.rowCount === 0) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    const signedUrl = await createReceiptSignedUrl(res.rows[0].receipt_storage_path)

    return NextResponse.json({
      success: true,
      data: { url: signedUrl },
    })
  } catch (err) {
    console.error("Receipt URL error:", err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Could not load receipt" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()

  try {
    const session = await requireAdminSession()
    const { id } = await params
    const submissionId = Number(id)
    const body = await req.json()
    const action = body.action as "confirm" | "reject"
    const adminNote = String(body.admin_note ?? "")

    if (!Number.isFinite(submissionId)) {
      return NextResponse.json({ message: "Invalid submission id" }, { status: 400 })
    }

    if (action !== "confirm" && action !== "reject") {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    await client.query("BEGIN")

    if (action === "confirm") {
      const result = await confirmManualPaymentSubmission(
        client,
        submissionId,
        session.user_id,
        adminNote || undefined
      )

      if (!result.ok) {
        await client.query("ROLLBACK")
        return NextResponse.json({ message: result.reason }, { status: 400 })
      }

      await client.query("COMMIT")

      return NextResponse.json({
        message: result.alreadyConfirmed
          ? "Payment was already confirmed"
          : "Payment confirmed and fulfilled",
      })
    }

    const result = await rejectManualPaymentSubmission(
      client,
      submissionId,
      session.user_id,
      adminNote
    )

    if (!result.ok) {
      await client.query("ROLLBACK")
      return NextResponse.json({ message: result.reason }, { status: 400 })
    }

    await client.query("COMMIT")

    return NextResponse.json({
      message: "Transfer proof rejected. Customer can submit again.",
    })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Manual payment review error:", err)
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Could not review submission",
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
