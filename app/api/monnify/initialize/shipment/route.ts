import { pool } from "@/lib/db/db"
import { getHost } from "@/lib/db/getHost"
import { getSession } from "@/lib/db/session"
import { initializeMonnifyPayment } from "@/lib/monnify/initialize"
import { isMonnifyCheckoutEnabled } from "@/lib/bankTransfer/config"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!isMonnifyCheckoutEnabled()) {
      return NextResponse.json(
        { message: "Card payment is temporarily unavailable" },
        { status: 503 }
      )
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { transaction_ref } = await req.json()

    if (!transaction_ref) {
      return NextResponse.json(
        { message: "transaction_ref is required" },
        { status: 400 }
      )
    }

    const paymentRes = await pool.query(
      `
      SELECT p.*, u.email, u.first_name, u.last_name
      FROM payments p
      JOIN users u ON u.id = p.user_id
      WHERE p.transaction_ref = $1 AND p.user_id = $2
      LIMIT 1
      `,
      [transaction_ref, session.user_id]
    )

    if (paymentRes.rowCount === 0) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    const payment = paymentRes.rows[0]

    if (payment.status === "paid") {
      return NextResponse.json({ message: "Payment already completed" }, { status: 400 })
    }

    const origin = getHost(req)
    const customerName =
      `${payment.first_name ?? ""} ${payment.last_name ?? ""}`.trim() || payment.email

    const checkout = await initializeMonnifyPayment({
      amount: Number(payment.amount),
      customerName,
      customerEmail: payment.email,
      paymentReference: payment.transaction_ref,
      paymentDescription: "DHEIR shipment payment",
      redirectUrl: `${origin}/customer/verify_payment?paymentReference=${encodeURIComponent(payment.transaction_ref)}`,
      metaData: {
        type: "shipment",
        shipment_tracking_number: payment.shipment_tracking_number,
      },
    })

    return NextResponse.json({
      message: "Payment initialized",
      data: checkout,
    })
  } catch (err) {
    console.error("Shipment payment initialization failed:", err)
    return NextResponse.json(
      { message: "Error initializing payment" },
      { status: 500 }
    )
  }
}
