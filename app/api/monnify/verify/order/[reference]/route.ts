import { pool } from "@/lib/db/db"
import {
  fulfillOrderPayment,
  markOrderPaymentFailed,
} from "@/lib/monnify/fulfillment"
import { isMonnifyPaymentPaid, verifyMonnifyTransaction } from "@/lib/monnify/verify"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const client = await pool.connect()

  try {
    const { reference } = await params
    const transaction = await verifyMonnifyTransaction(reference)
    const paymentReference = transaction.paymentReference

    if (!isMonnifyPaymentPaid(transaction.paymentStatus)) {
      await client.query("BEGIN")
      await markOrderPaymentFailed(client, paymentReference)
      await client.query("COMMIT")

      return NextResponse.json({
        message: "Payment not successful",
        redirect_to: `${process.env.NEXT_PUBLIC_APP_URL}/base/marketplace`,
      })
    }

    await client.query("BEGIN")
    const result = await fulfillOrderPayment(client, paymentReference)
    await client.query("COMMIT")

    if (!result.ok) {
      return NextResponse.json({ message: result.reason }, { status: 404 })
    }

    return NextResponse.json({
      message: "Payment verified",
      redirect_to: `${process.env.NEXT_PUBLIC_APP_URL}/base/marketplace`,
    })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Order payment verification failed:", err)
    return NextResponse.json(
      {
        message: "Verification failed",
        redirect_to: `${process.env.NEXT_PUBLIC_APP_URL}/base/marketplace`,
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
