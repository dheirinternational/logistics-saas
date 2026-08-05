import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden", success: false }, { status: 403 })
    }

    // Query outstanding shipments & orders
    // Overdue shipments: status is in_transit, shipped, arrived, out_for_delivery, delivered AND paid_for = false
    const shipmentsQuery = await dbQuery<{
      tracking_number: string
      customer_code: string
      channel: string
      total_cost: number
      paid_for: boolean
      status: string
      created_at: string
    }>(`
      SELECT 
        tracking_number,
        customer_code,
        channel,
        total_cost::numeric,
        paid_for,
        status,
        created_at
      FROM shipments
      ORDER BY created_at DESC;
    `)

    const shipments = shipmentsQuery.rows.map((s) => {
      // Overdue condition: unpaid and status is processed beyond initial stages
      const isOverdue = !s.paid_for && ["shipped", "in_transit", "arrived", "out_for_delivery", "delivered"].includes(s.status)
      return {
        id: s.tracking_number,
        reference: s.tracking_number,
        customer_code: s.customer_code,
        channel: s.channel,
        amount: Number(s.total_cost || 0),
        status: s.status,
        paid: s.paid_for,
        type: "Shipment",
        overdue: isOverdue,
        created_at: s.created_at,
      }
    })

    // Calculate aggregated metrics
    let totalOutstanding = 0
    let totalOverdue = 0
    let totalCollected = 0

    shipments.forEach((s) => {
      if (s.paid) {
        totalCollected += s.amount
      } else {
        totalOutstanding += s.amount
        if (s.overdue) {
          totalOverdue += s.amount
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalOutstanding,
          totalOverdue,
          totalCollected,
        },
        records: shipments,
      },
    })
  } catch (err) {
    console.error("Error generating payment summary ledger details", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
