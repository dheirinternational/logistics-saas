import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { generateOrderTrackingNumber } from "@/lib/generators/generateTrackingNumber"
import { CartProduct } from "@/types/entityTypeDef"
import { getUnitPriceForQuantity } from "@/lib/shop/pricing"
import type { PoolClient } from "pg"
import {
  assertOrderPayable,
  assertShipmentPayable,
  getActiveSubmissionForReference,
  markOrderAwaitingConfirmation,
  markShipmentAwaitingConfirmation,
  writeManualPaymentAudit,
} from "./service"
import { uploadPaymentReceipt } from "./storage"

export async function createOrderForBankTransfer(params: {
  userId: number
  email: string
  amount: number
  deliveryFee: number
  extraCharges: number
  destinationAddress: string
  customerCode: string
  cartItems: CartProduct[]
}) {
  const client = await pool.connect()
  const orderId = generateOrderTrackingNumber()

  try {
    await client.query("BEGIN")

    const productIds = params.cartItems.map((item) => item.id)

    const productsRes = await client.query(
      `
      SELECT id, stock_quantity, name
      FROM products
      WHERE id = ANY($1)
      FOR UPDATE
      `,
      [productIds]
    )

    const productMap = new Map(productsRes.rows.map((p) => [p.id, p]))

    for (const item of params.cartItems) {
      const product = productMap.get(item.id)

      if (!product) {
        throw new Error("Product not found")
      }

      if (item.amount_to_be_ordered > product.stock_quantity) {
        throw new Error(`${product.name} is out of stock`)
      }
    }

    await client.query(
      `
      INSERT INTO orders (
        order_id,
        user_id,
        total_price,
        delivery_fee,
        extra_charges,
        payment_status,
        payment_type,
        status,
        destination_address,
        customer_code,
        paystack_reference
      )
      VALUES ($1, $2, $3, $4, $5, 'pending', 'transfer', 'Confirmed', $6, $7, $8)
      `,
      [
        orderId,
        params.userId,
        params.amount,
        params.deliveryFee,
        params.extraCharges,
        params.destinationAddress,
        params.customerCode,
        orderId,
      ]
    )

    for (const item of params.cartItems) {
      const price = getUnitPriceForQuantity({
        price: Number(item.price),
        discount_price: Number(item.discount_price ?? 0),
        discount_min_qty: Number(item.discount_min_qty ?? 0),
        quantity: Number(item.amount_to_be_ordered),
      })

      await client.query(
        `
        INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, product_image, product_name
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [
          orderId,
          item.id,
          Number(item.amount_to_be_ordered),
          price,
          item.image,
          item.name,
        ]
      )
    }

    await client.query("COMMIT")

    return { orderId, amount: params.amount }
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

export async function submitManualPaymentProof(params: {
  paymentType: "shipment" | "order"
  reference: string
  userId: number
  amount: number
  transferReference?: string
  customerNote?: string
  receiptFile: File
}) {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const result = await submitManualPaymentProofTx(client, params)
    await client.query("COMMIT")
    return result
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

/**
 * Transactional variant used when the caller needs atomicity across multiple writes
 * (e.g. create order + attach manual payment submission).
 * The caller must manage BEGIN/COMMIT/ROLLBACK.
 */
export async function submitManualPaymentProofTx(
  client: PoolClient,
  params: {
    paymentType: "shipment" | "order"
    reference: string
    userId: number
    amount: number
    transferReference?: string
    customerNote?: string
    receiptFile: File
  }
) {
  if (params.paymentType === "shipment") {
    await assertShipmentPayable(client, params.reference, params.userId)
  } else {
    await assertOrderPayable(client, params.reference, params.userId)
  }

  const existing = await getActiveSubmissionForReference(
    client,
    params.paymentType,
    params.reference
  )

  if (existing) {
    throw new Error("A transfer proof is already awaiting confirmation")
  }

  const upload = await uploadPaymentReceipt({
    file: params.receiptFile,
    userId: params.userId,
    paymentType: params.paymentType,
    reference: params.reference,
  })

  const insertRes = await client.query<{ id: number }>(
    `
    INSERT INTO manual_payment_submissions (
      payment_type,
      reference,
      user_id,
      amount,
      transfer_reference,
      customer_note,
      receipt_storage_path,
      receipt_mime_type,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'awaiting_confirmation')
    RETURNING id
    `,
    [
      params.paymentType,
      params.reference,
      params.userId,
      params.amount,
      params.transferReference?.trim() || null,
      params.customerNote?.trim() || null,
      upload.storagePath,
      upload.mimeType,
    ]
  )

  const submissionId = insertRes.rows[0].id

  if (params.paymentType === "shipment") {
    await markShipmentAwaitingConfirmation(client, params.reference)
  } else {
    await markOrderAwaitingConfirmation(client, params.reference)
  }

  await writeManualPaymentAudit(client, {
    submissionId,
    actorUserId: params.userId,
    action: "submitted",
    details: {
      payment_type: params.paymentType,
      reference: params.reference,
      amount: params.amount,
      transfer_reference: params.transferReference?.trim() || null,
    },
  })

  return { submissionId }
}

export async function getManualPaymentContextForUser(
  paymentType: "shipment" | "order",
  reference: string,
  userId: number
) {
  if (paymentType === "shipment") {
    const res = await pool.query(
      `
      SELECT transaction_ref, amount, status, shipment_tracking_number
      FROM payments
      WHERE transaction_ref = $1 AND user_id = $2
      LIMIT 1
      `,
      [reference, userId]
    )

    if (res.rowCount === 0) return null

    const payment = res.rows[0]
    const submission = await pool.query(
      `
      SELECT id, status, created_at, admin_note
      FROM manual_payment_submissions
      WHERE payment_type = 'shipment'
        AND reference = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [reference]
    )

    return {
      paymentType,
      reference,
      amount: Number(payment.amount),
      label: payment.shipment_tracking_number,
      status: payment.status,
      latestSubmission: submission.rows[0] ?? null,
    }
  }

  const res = await pool.query(
    `
    SELECT order_id, total_price, payment_status
    FROM orders
    WHERE (order_id = $1 OR paystack_reference = $1) AND user_id = $2
    LIMIT 1
    `,
    [reference, userId]
  )

  if (res.rowCount === 0) return null

  const order = res.rows[0]
  const submission = await pool.query(
    `
    SELECT id, status, created_at, admin_note
    FROM manual_payment_submissions
    WHERE payment_type = 'order'
      AND reference = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [order.order_id]
  )

  return {
    paymentType,
    reference: order.order_id,
    amount: Number(order.total_price),
    label: order.order_id,
    status: order.payment_status,
    latestSubmission: submission.rows[0] ?? null,
  }
}

export async function requireCustomerSession() {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireAdminSession() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    throw new Error("Forbidden")
  }
  return session
}
