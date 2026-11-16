import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { hasStaffPermission } from "@/lib/rbac/permissions"
import { NextResponse } from "next/server"

export type PaymentMethodKind = "paystack" | "bank_transfer" | "manual" | "unpaid"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    if (!hasStaffPermission(session, "payments:manage")) {
      return NextResponse.json({ message: "Forbidden", success: false }, { status: 403 })
    }

    const shipmentsQuery = await dbQuery<{
      tracking_number: string
      customer_code: string
      shipping_channel: string
      total_cost: number
      paid_for: boolean
      shipment_status: string
      created_at: string
      payment_ref: string | null
      payment_channel: string | null
      payment_status: string | null
      paid_at: string | null
      manual_submission_id: number | null
    }>(`
      SELECT
        s.tracking_number,
        s.customer_code,
        s.channel AS shipping_channel,
        s.total_cost::numeric AS total_cost,
        s.paid_for,
        s.status AS shipment_status,
        s.created_at,
        p.transaction_ref AS payment_ref,
        p.channel AS payment_channel,
        p.status AS payment_status,
        p.paid_at,
        mps.id AS manual_submission_id
      FROM shipments s
      LEFT JOIN LATERAL (
        SELECT transaction_ref, channel, status, paid_at
        FROM payments
        WHERE shipment_tracking_number = s.tracking_number
        ORDER BY (status = 'paid') DESC, paid_at DESC NULLS LAST, created_at DESC
        LIMIT 1
      ) p ON true
      LEFT JOIN LATERAL (
        SELECT id
        FROM manual_payment_submissions
        WHERE payment_type = 'shipment'
          AND (reference = s.tracking_number OR reference = p.transaction_ref)
          AND status = 'confirmed'
        ORDER BY reviewed_at DESC NULLS LAST, created_at DESC
        LIMIT 1
      ) mps ON true
      ORDER BY s.created_at DESC
    `)

    const ordersQuery = await dbQuery<{
      order_id: string
      customer_code: string | null
      total_cost: number
      payment_type: string | null
      payment_status: string | null
      order_status: string | null
      paystack_reference: string | null
      paid_at: string | null
      created_at: string
      manual_submission_id: number | null
    }>(`
      SELECT
        o.order_id,
        o.customer_code,
        o.total_price::numeric AS total_cost,
        o.payment_type,
        o.payment_status,
        o.status AS order_status,
        o.paystack_reference,
        o.paid_at,
        o.created_at,
        mps.id AS manual_submission_id
      FROM orders o
      LEFT JOIN LATERAL (
        SELECT id
        FROM manual_payment_submissions
        WHERE payment_type = 'order'
          AND (reference = o.order_id OR reference = o.paystack_reference)
          AND status = 'confirmed'
        ORDER BY reviewed_at DESC NULLS LAST, created_at DESC
        LIMIT 1
      ) mps ON true
      ORDER BY o.created_at DESC
    `)

    const shipmentRecords = shipmentsQuery.rows.map((s) => {
      const paid = Boolean(s.paid_for) || s.payment_status === "paid"
      const isOverdue =
        !paid &&
        ["shipped", "in_transit", "arrived", "out_for_delivery", "delivered"].includes(
          s.shipment_status
        )

      let paymentMethod: PaymentMethodKind = "unpaid"
      if (paid) {
        if (s.payment_channel === "paystack") {
          paymentMethod = "paystack"
        } else if (s.payment_channel === "bank_transfer" || Boolean(s.manual_submission_id)) {
          paymentMethod = "bank_transfer"
        } else {
          paymentMethod = "manual"
        }
      }

      return {
        id: `shipment:${s.tracking_number}`,
        reference: s.tracking_number,
        payment_ref: s.payment_ref,
        customer_code: s.customer_code,
        channel: s.shipping_channel,
        payment_method: paymentMethod,
        amount: Number(s.total_cost || 0),
        status: s.shipment_status,
        paid,
        paid_at: s.paid_at,
        type: "Shipment",
        overdue: isOverdue,
        created_at: s.created_at,
      }
    })

    const orderRecords = ordersQuery.rows.map((o) => {
      const paid = o.payment_status === "paid"
      let paymentMethod: PaymentMethodKind = "unpaid"
      if (paid) {
        if (
          o.payment_type === "paystack" ||
          (Boolean(o.paystack_reference) && o.payment_type !== "bank_transfer")
        ) {
          paymentMethod = "paystack"
        } else if (o.payment_type === "bank_transfer" || Boolean(o.manual_submission_id)) {
          paymentMethod = "bank_transfer"
        } else {
          paymentMethod = "manual"
        }
      }

      return {
        id: `order:${o.order_id}`,
        reference: o.order_id,
        payment_ref: o.paystack_reference,
        customer_code: o.customer_code || "Customer",
        channel: "order",
        payment_method: paymentMethod,
        amount: Number(o.total_cost || 0),
        status: o.order_status || "pending",
        paid,
        paid_at: o.paid_at,
        type: "Order",
        overdue: false,
        created_at: o.created_at,
      }
    })

    const records = [...shipmentRecords, ...orderRecords].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let totalOutstanding = 0
    let totalOverdue = 0
    let totalCollected = 0
    let totalPaystackCollected = 0
    let totalBankTransferCollected = 0
    let totalManualCollected = 0
    let paystackCount = 0
    let bankTransferCount = 0
    let manualCount = 0
    let paidCount = 0

    for (const r of records) {
      if (r.paid) {
        paidCount += 1
        totalCollected += r.amount
        if (r.payment_method === "paystack") {
          paystackCount += 1
          totalPaystackCollected += r.amount
        } else if (r.payment_method === "bank_transfer") {
          bankTransferCount += 1
          totalBankTransferCollected += r.amount
        } else {
          manualCount += 1
          totalManualCollected += r.amount
        }
      } else {
        totalOutstanding += r.amount
        if (r.overdue) {
          totalOverdue += r.amount
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalOutstanding,
          totalOverdue,
          totalCollected,
          totalPaystackCollected,
          totalBankTransferCollected,
          totalManualCollected,
          paystackCount,
          bankTransferCount,
          manualCount,
          paidCount,
        },
        records,
      },
    })
  } catch (err) {
    console.error("Error generating payment summary ledger details", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
