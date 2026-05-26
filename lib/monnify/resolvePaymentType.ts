import { pool } from "@/lib/db/db"
import type { MonnifyPaymentType } from "./types"

export async function resolvePaymentType(
  paymentReference: string
): Promise<MonnifyPaymentType | null> {
  const paymentRes = await pool.query(
    `SELECT 1 FROM payments WHERE transaction_ref = $1 LIMIT 1`,
    [paymentReference]
  )

  if (paymentRes.rowCount && paymentRes.rowCount > 0) {
    return "shipment"
  }

  const orderRes = await pool.query(
    `
    SELECT 1 FROM orders
    WHERE paystack_reference = $1 OR order_id = $1
    LIMIT 1
    `,
    [paymentReference]
  )

  if (orderRes.rowCount && orderRes.rowCount > 0) {
    return "order"
  }

  return null
}
