import { pool } from "@/lib/db/db"
import { getHost } from "@/lib/db/getHost"
import { getSession } from "@/lib/db/session"
import { initializePaystackPayment } from "@/lib/paystack/initialize"
import { isPaystackCheckoutEnabled } from "@/lib/bankTransfer/config"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!isPaystackCheckoutEnabled()) {
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

    let paymentRes = await pool.query(
      `
      SELECT p.*, u.email, u.first_name, u.last_name
      FROM payments p
      JOIN users u ON u.id = p.user_id
      WHERE (p.transaction_ref = $1 OR p.shipment_tracking_number = $1) AND p.user_id = $2
      ORDER BY p.created_at DESC
      LIMIT 1
      `,
      [transaction_ref, session.user_id]
    )

    if (paymentRes.rowCount === 0) {
      const shipRes = await pool.query(
        `
        SELECT s.*, u.email, u.first_name, u.last_name
        FROM shipments s
        JOIN users u ON u.id = s.user_id
        WHERE s.tracking_number = $1 AND s.user_id = $2
        LIMIT 1
        `,
        [transaction_ref, session.user_id]
      )

      if (shipRes.rowCount === 0) {
        return NextResponse.json({ message: "Payment not found" }, { status: 404 })
      }

      const shipment = shipRes.rows[0]
      const amount = Number(shipment.total_cost || 0)
      const newRef = transaction_ref.startsWith("TRK-") ? `SHIP-${transaction_ref}` : transaction_ref

      await pool.query(
        `
        INSERT INTO payments (transaction_ref, shipment_tracking_number, user_id, customer_code, amount, channel, status)
        VALUES ($1, $2, $3, $4, $5, 'paystack', $6)
        ON CONFLICT (transaction_ref) DO UPDATE SET amount = EXCLUDED.amount
        `,
        [newRef, shipment.tracking_number, session.user_id, shipment.customer_code, amount, shipment.paid_for ? 'paid' : 'pending']
      )

      paymentRes = await pool.query(
        `
        SELECT p.*, u.email, u.first_name, u.last_name
        FROM payments p
        JOIN users u ON u.id = p.user_id
        WHERE p.transaction_ref = $1 AND p.user_id = $2
        LIMIT 1
        `,
        [newRef, session.user_id]
      )
    }

    const payment = paymentRes.rows[0]

    if (payment.status === "paid") {
      return NextResponse.json({ message: "Payment already completed" }, { status: 400 })
    }

    const origin = getHost(req)
    const customerName =
      `${payment.first_name ?? ""} ${payment.last_name ?? ""}`.trim() || payment.email

    const checkout = await initializePaystackPayment({
      amount: Number(payment.amount),
      customerName,
      customerEmail: payment.email,
      paymentReference: payment.transaction_ref,
      redirectUrl: `${origin}/customer/verify_payment?reference=${encodeURIComponent(payment.transaction_ref)}`,
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
    console.error("Paystack shipment payment initialization failed:", err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error initializing payment" },
      { status: 500 }
    )
  }
}

