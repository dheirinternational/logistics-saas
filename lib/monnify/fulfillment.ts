import type { PoolClient } from "pg"

export async function fulfillShipmentPayment(
  client: PoolClient,
  paymentReference: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const paymentRes = await client.query(
    `
    SELECT *
    FROM payments
    WHERE transaction_ref = $1
    FOR UPDATE
    `,
    [paymentReference]
  )

  if (paymentRes.rowCount === 0) {
    return { ok: false, reason: "Payment not found" }
  }

  const payment = paymentRes.rows[0]

  if (payment.status === "paid") {
    return { ok: true }
  }

  await client.query(
    `
    UPDATE payments
    SET status = 'paid',
        paid_at = NOW()
    WHERE transaction_ref = $1
    `,
    [paymentReference]
  )

  await client.query(
    `
    UPDATE shipments
    SET paid_for = true,
        status = 'processing',
        payment_time = NOW()::text
    WHERE tracking_number = $1
    `,
    [payment.shipment_tracking_number]
  )

  return { ok: true }
}

export async function fulfillOrderPayment(
  client: PoolClient,
  paymentReference: string
): Promise<{ ok: true; orderId?: string } | { ok: false; reason: string }> {
  const orderRes = await client.query(
    `
    SELECT order_id, payment_status
    FROM orders
    WHERE paystack_reference = $1 OR order_id = $1
    FOR UPDATE
    `,
    [paymentReference]
  )

  if (orderRes.rowCount === 0) {
    return { ok: false, reason: "Order not found" }
  }

  const order = orderRes.rows[0]

  if (order.payment_status === "paid") {
    return { ok: true, orderId: order.order_id }
  }

  const itemsRes = await client.query(
    `
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = $1
    `,
    [order.order_id]
  )

  const productIds = itemsRes.rows.map((i) => i.product_id)

  const productsRes = await client.query(
    `
    SELECT id, stock_quantity
    FROM products
    WHERE id = ANY($1)
    FOR UPDATE
    `,
    [productIds]
  )

  const productMap = new Map(productsRes.rows.map((p) => [Number(p.id), p]))

  for (const item of itemsRes.rows) {
    const product = productMap.get(Number(item.product_id))

    if (!product || Number(product.stock_quantity) < Number(item.quantity)) {
      throw new Error("Stock inconsistency detected")
    }

    await client.query(
      `
      UPDATE products
      SET stock_quantity = stock_quantity - $1
      WHERE id = $2
      `,
      [item.quantity, item.product_id]
    )
  }

  await client.query(
    `
    UPDATE orders
    SET payment_status = 'paid',
        paid_at = NOW(),
        updated_at = NOW()
    WHERE order_id = $1
    `,
    [order.order_id]
  )

  return { ok: true, orderId: order.order_id }
}

export async function markOrderPaymentFailed(
  client: PoolClient,
  paymentReference: string
) {
  await client.query(
    `
    UPDATE orders
    SET payment_status = 'failed',
        updated_at = NOW()
    WHERE paystack_reference = $1 OR order_id = $1
    `,
    [paymentReference]
  )
}
