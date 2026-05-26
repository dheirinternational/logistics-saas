import { pool } from "@/lib/db/db"
import {
  fulfillOrderPayment,
  fulfillShipmentPayment,
  markOrderPaymentFailed,
} from "@/lib/monnify/fulfillment"
import { resolvePaymentType } from "@/lib/monnify/resolvePaymentType"
import { verifyMonnifySignature } from "@/lib/monnify/signature"
import { isMonnifyPaymentPaid } from "@/lib/monnify/verify"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const client = await pool.connect()

  try {
        const rawBody = await req.text()
        const signature = req.headers.get("monnify-signature") || ""

    if (!verifyMonnifySignature(rawBody, signature)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
        }

        const body = JSON.parse(rawBody) 
    const eventType = body.eventType
    const eventData = body.eventData ?? {}

    if (eventType !== "SUCCESSFUL_TRANSACTION") {
      return NextResponse.json({ received: true })
    }

    const paymentReference =
      eventData.paymentReference ??
      eventData.product?.reference ??
      eventData.transactionReference

    if (!paymentReference) {
      return NextResponse.json({ message: "Missing payment reference" }, { status: 400 })
    }

    const paymentStatus = eventData.paymentStatus

    if (!isMonnifyPaymentPaid(paymentStatus)) {
      const paymentType = await resolvePaymentType(paymentReference)

      if (paymentType === "order") {
        await client.query("BEGIN")
        await markOrderPaymentFailed(client, paymentReference)
        await client.query("COMMIT")
      }

      return NextResponse.json({ received: true })
    }

    const paymentType =
      eventData.metaData?.type === "shipment" || eventData.metaData?.type === "order"
        ? eventData.metaData.type
        : await resolvePaymentType(paymentReference)

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

    console.warn("Monnify webhook: unknown payment type for reference", paymentReference)
    return NextResponse.json({ received: true })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Monnify webhook error:", err)
    return NextResponse.json({ success: false }, { status: 500 })
    } finally {
    client.release()
    }
}
