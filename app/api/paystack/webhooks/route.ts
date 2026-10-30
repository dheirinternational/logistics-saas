import { pool } from "@/lib/db/db"
import {
  fulfillOrderPayment,
  fulfillShipmentPayment,
  markOrderPaymentFailed,
} from "@/lib/paystack/fulfillment"
import { resolvePaymentType } from "@/lib/paystack/resolvePaymentType"
import { verifyPaystackSignature } from "@/lib/paystack/signature"
import { isPaystackPaymentPaid } from "@/lib/paystack/verify"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const client = await pool.connect()

  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-paystack-signature") || ""

    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const eventType = body.event
    const data = body.data ?? {}

    if (eventType !== "charge.success") {
      return NextResponse.json({ received: true })
    }

    const paymentReference = data.reference
    if (!paymentReference) {
      return NextResponse.json({ message: "Missing payment reference" }, { status: 400 })
    }

    const paymentStatus = data.status

    if (!isPaystackPaymentPaid(paymentStatus)) {
      const paymentType = await resolvePaymentType(paymentReference)

      if (paymentType === "order") {
        await client.query("BEGIN")
        await markOrderPaymentFailed(client, paymentReference)
        await client.query("COMMIT")
      }

      return NextResponse.json({ received: true })
    }

    const paymentType =
      data.metadata?.type === "shipment" || data.metadata?.type === "order"
        ? data.metadata.type
        : await resolvePaymentType(paymentReference, client)

    if (paymentType === "shipment") {
      await client.query("BEGIN")
      const result = await fulfillShipmentPayment(client, paymentReference)
      await client.query("COMMIT")

      if (!result.ok) {
        return NextResponse.json({ message: result.reason }, { status: 404 })
      }

      return NextResponse.json({ status: "ok" })
    }

    if (paymentType === "order") {
      await client.query("BEGIN")
      const result = await fulfillOrderPayment(client, paymentReference)
      await client.query("COMMIT")

      if (!result.ok) {
        return NextResponse.json({ message: result.reason }, { status: 404 })
      }

      return NextResponse.json({ status: "ok" })
    }

    console.warn("Paystack webhook: unknown payment type for reference", paymentReference)
    return NextResponse.json({ received: true })
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined)
    console.error("Paystack webhook error:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  } finally {
    client.release()
  }
}

