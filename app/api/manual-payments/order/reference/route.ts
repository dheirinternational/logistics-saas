import { isBankTransferEnabled } from "@/lib/bankTransfer/config"
import { getSession } from "@/lib/db/session"
import { pool } from "@/lib/db/db"
import { generateOrderTrackingNumber } from "@/lib/generators/generateTrackingNumber"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    if (!isBankTransferEnabled()) {
      return NextResponse.json(
        { message: "Bank transfer is not available right now" },
        { status: 503 }
      )
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Generate a unique reference without creating an order record.
    // This reference will be used in narration and later used as the order_id when proof is submitted.
    for (let attempt = 0; attempt < 5; attempt++) {
      const reference = generateOrderTrackingNumber()
      const exists = await pool.query(
        `SELECT 1 FROM orders WHERE order_id = $1 LIMIT 1`,
        [reference]
      )
      if (exists.rowCount === 0) {
        return NextResponse.json({ success: true, data: { reference } })
      }
    }

    return NextResponse.json(
      { message: "Could not generate a payment reference" },
      { status: 500 }
    )
  } catch (err) {
    console.error("Manual order reference error:", err)
    return NextResponse.json(
      { message: "Could not generate a payment reference" },
      { status: 500 }
    )
  }
}

