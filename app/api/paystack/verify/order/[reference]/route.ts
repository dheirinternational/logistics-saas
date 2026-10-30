import { pool } from "@/lib/db/db"
import {
  fulfillOrderPayment,
  markOrderPaymentFailed,
} from "@/lib/paystack/fulfillment"
import { isPaystackPaymentPaid, verifyPaystackTransaction } from "@/lib/paystack/verify"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const client = await pool.connect()

  try {
    const { reference } = await params
    const transaction = await verifyPaystackTransaction(reference)
    const paymentReference = transaction.reference

    if (!isPaystackPaymentPaid(transaction.status)) {
      await client.query("BEGIN")
      await markOrderPaymentFailed(client, paymentReference)
      await client.query("COMMIT")

      return NextResponse.json({
        message: "Payment not successful",
        redirect_to: `${process.env.NEXT_PUBLIC_APP_URL || ""}/customer/marketplace`,
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
      redirect_to: `${process.env.NEXT_PUBLIC_APP_URL || ""}/customer/marketplace`,
    })
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined)
    console.error("Paystack order payment verification failed:", err)
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Verification failed",
        redirect_to: `${process.env.NEXT_PUBLIC_APP_URL || ""}/customer/marketplace`,
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

