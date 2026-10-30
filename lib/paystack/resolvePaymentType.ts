import { pool } from "@/lib/db/db"
import type { PoolClient } from "pg"
import type { PaystackPaymentType } from "./types"

export async function resolvePaymentType(
  paymentReference: string,
  client?: PoolClient
): Promise<PaystackPaymentType | null> {
  const db = client ?? pool
  const paymentRes = await db.query(
    `SELECT 1 FROM payments WHERE transaction_ref = $1 LIMIT 1`,
    [paymentReference]
  )

  if (paymentRes.rowCount && paymentRes.rowCount > 0) {
    return "shipment"
  }

  const orderRes = await db.query(
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
