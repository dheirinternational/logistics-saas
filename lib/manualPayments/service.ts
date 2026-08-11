import type { PoolClient } from "pg"
import {
  fulfillOrderPayment,
  fulfillShipmentPayment,
} from "@/lib/monnify/fulfillment"
import type {
  ManualPaymentSubmission,
  ManualPaymentSubmissionWithCustomer,
  ManualPaymentType,
} from "./types"

export async function writeManualPaymentAudit(
  client: PoolClient,
  params: {
    submissionId: number
    actorUserId: number | null
    action: "submitted" | "confirmed" | "rejected" | "superseded"
    details?: Record<string, unknown>
  }
) {
  await client.query(
    `
    INSERT INTO manual_payment_audit_log (submission_id, actor_user_id, action, details)
    VALUES ($1, $2, $3, $4)
    `,
    [
      params.submissionId,
      params.actorUserId,
      params.action,
      params.details ? JSON.stringify(params.details) : null,
    ]
  )
}

export async function getActiveSubmissionForReference(
  client: PoolClient,
  paymentType: ManualPaymentType,
  reference: string
) {
  const res = await client.query<ManualPaymentSubmission>(
    `
    SELECT *
    FROM manual_payment_submissions
    WHERE payment_type = $1
      AND reference = $2
      AND status = 'awaiting_confirmation'
    LIMIT 1
    `,
    [paymentType, reference]
  )

  return res.rows[0] ?? null
}

export async function assertShipmentPayable(
  client: PoolClient,
  reference: string,
  userId: number
) {
  const res = await client.query(
    `
    SELECT id, amount, status, user_id, shipment_tracking_number
    FROM payments
    WHERE transaction_ref = $1
    FOR UPDATE
    `,
    [reference]
  )

  if (res.rowCount === 0) {
    throw new Error("Payment not found")
  }

  const payment = res.rows[0]

  if (Number(payment.user_id) !== userId) {
    throw new Error("Forbidden")
  }

  if (payment.status === "paid") {
    throw new Error("This payment has already been completed")
  }

  if (payment.status === "awaiting_confirmation") {
    throw new Error("A transfer proof is already awaiting confirmation")
  }

  if (payment.status !== "pending") {
    throw new Error("This payment cannot accept a transfer at this time")
  }

  return payment
}

export async function assertOrderPayable(
  client: PoolClient,
  reference: string,
  userId: number
) {
  const res = await client.query(
    `
    SELECT order_id, total_price, payment_status, user_id
    FROM orders
    WHERE order_id = $1 OR paystack_reference = $1
    FOR UPDATE
    `,
    [reference]
  )

  if (res.rowCount === 0) {
    throw new Error("Order not found")
  }

  const order = res.rows[0]

  if (Number(order.user_id) !== userId) {
    throw new Error("Forbidden")
  }

  if (order.payment_status === "paid") {
    throw new Error("This order has already been paid")
  }

  if (order.payment_status === "awaiting_confirmation") {
    throw new Error("A transfer proof is already awaiting confirmation")
  }

  if (!["pending", "failed"].includes(String(order.payment_status))) {
    throw new Error("This order cannot accept a transfer at this time")
  }

  return order
}

export async function markShipmentAwaitingConfirmation(
  client: PoolClient,
  reference: string
) {
  await client.query(
    `
    UPDATE payments
    SET status = 'awaiting_confirmation',
        channel = 'bank_transfer'
    WHERE transaction_ref = $1
    `,
    [reference]
  )
}

export async function markOrderAwaitingConfirmation(
  client: PoolClient,
  reference: string
) {
  await client.query(
    `
    UPDATE orders
    SET payment_status = 'awaiting_confirmation',
        payment_type = 'transfer',
        updated_at = NOW()
    WHERE order_id = $1 OR paystack_reference = $1
    `,
    [reference]
  )
}

export async function resetShipmentAfterRejection(
  client: PoolClient,
  reference: string
) {
  await client.query(
    `
    UPDATE payments
    SET status = 'pending',
        channel = NULL
    WHERE transaction_ref = $1
      AND status = 'awaiting_confirmation'
    `,
    [reference]
  )
}

export async function resetOrderAfterRejection(
  client: PoolClient,
  reference: string
) {
  await client.query(
    `
    UPDATE orders
    SET payment_status = 'pending',
        updated_at = NOW()
    WHERE (order_id = $1 OR paystack_reference = $1)
      AND payment_status = 'awaiting_confirmation'
    `,
    [reference]
  )
}

export async function confirmManualPaymentSubmission(
  client: PoolClient,
  submissionId: number,
  adminUserId: number,
  adminNote?: string
) {
  const submissionRes = await client.query<ManualPaymentSubmission>(
    `
    SELECT *
    FROM manual_payment_submissions
    WHERE id = $1
    FOR UPDATE
    `,
    [submissionId]
  )

  if (submissionRes.rowCount === 0) {
    return { ok: false as const, reason: "Submission not found" }
  }

  const submission = submissionRes.rows[0]

  if (submission.status === "confirmed") {
    return { ok: true as const, alreadyConfirmed: true }
  }

  if (submission.status !== "awaiting_confirmation") {
    return { ok: false as const, reason: "Submission is not awaiting confirmation" }
  }

  if (submission.payment_type === "shipment") {
    const paymentRes = await client.query(
      `
      SELECT amount, status
      FROM payments
      WHERE transaction_ref = $1
      FOR UPDATE
      `,
      [submission.reference]
    )

    if (paymentRes.rowCount === 0) {
      return { ok: false as const, reason: "Linked shipment payment not found" }
    }

    const payment = paymentRes.rows[0]

    if (payment.status === "paid") {
      await client.query(
        `
        UPDATE manual_payment_submissions
        SET status = 'superseded',
            admin_note = COALESCE($2, admin_note),
            reviewed_by = $3,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        `,
        [submissionId, adminNote ?? "Payment already marked paid", adminUserId]
      )

      await writeManualPaymentAudit(client, {
        submissionId,
        actorUserId: adminUserId,
        action: "superseded",
        details: { reason: "payment_already_paid" },
      })

      return { ok: true as const, alreadyConfirmed: true }
    }

    const expectedAmount = Number(payment.amount)
    const submittedAmount = Number(submission.amount)

    if (Math.abs(expectedAmount - submittedAmount) > 0.009) {
      return {
        ok: false as const,
        reason: `Amount mismatch: expected ₦${expectedAmount.toLocaleString()}, submission is ₦${submittedAmount.toLocaleString()}`,
      }
    }

    const fulfillResult = await fulfillShipmentPayment(client, submission.reference)

    if (!fulfillResult.ok) {
      return { ok: false as const, reason: fulfillResult.reason }
    }

    await client.query(
      `
      UPDATE payments
      SET channel = 'bank_transfer'
      WHERE transaction_ref = $1
      `,
      [submission.reference]
    )
  }

  if (submission.payment_type === "order") {
    const orderRes = await client.query(
      `
      SELECT total_price, payment_status
      FROM orders
      WHERE order_id = $1 OR paystack_reference = $1
      FOR UPDATE
      `,
      [submission.reference]
    )

    if (orderRes.rowCount === 0) {
      return { ok: false as const, reason: "Linked order not found" }
    }

    const order = orderRes.rows[0]

    if (order.payment_status === "paid") {
      await client.query(
        `
        UPDATE manual_payment_submissions
        SET status = 'superseded',
            admin_note = COALESCE($2, admin_note),
            reviewed_by = $3,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        `,
        [submissionId, adminNote ?? "Order already marked paid", adminUserId]
      )

      await writeManualPaymentAudit(client, {
        submissionId,
        actorUserId: adminUserId,
        action: "superseded",
        details: { reason: "order_already_paid" },
      })

      return { ok: true as const, alreadyConfirmed: true }
    }

    const expectedAmount = Number(order.total_price)
    const submittedAmount = Number(submission.amount)

    if (Math.abs(expectedAmount - submittedAmount) > 0.009) {
      return {
        ok: false as const,
        reason: `Amount mismatch: expected ₦${expectedAmount.toLocaleString()}, submission is ₦${submittedAmount.toLocaleString()}`,
      }
    }

    const fulfillResult = await fulfillOrderPayment(client, submission.reference)

    if (!fulfillResult.ok) {
      return { ok: false as const, reason: fulfillResult.reason }
    }
  }

  if (submission.payment_type === "procurement_commitment") {
    await client.query(
      `
      UPDATE procurement_requests
      SET commitment_fee_paid = true,
          updated_at = NOW()
      WHERE reference_number = $1
      `,
      [submission.reference]
    )
  }

  if (submission.payment_type === "procurement_quote") {
    await client.query(
      `
      UPDATE procurement_requests
      SET status = 'committed',
          commitment_fee_paid = true,
          updated_at = NOW()
      WHERE reference_number = $1
      `,
      [submission.reference]
    )
  }

  await client.query(
    `
    UPDATE manual_payment_submissions
    SET status = 'confirmed',
        admin_note = COALESCE($2, admin_note),
        reviewed_by = $3,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    `,
    [submissionId, adminNote ?? null, adminUserId]
  )

  await writeManualPaymentAudit(client, {
    submissionId,
    actorUserId: adminUserId,
    action: "confirmed",
    details: {
      payment_type: submission.payment_type,
      reference: submission.reference,
      amount: submission.amount,
    },
  })

  return { ok: true as const, alreadyConfirmed: false }
}

export async function rejectManualPaymentSubmission(
  client: PoolClient,
  submissionId: number,
  adminUserId: number,
  adminNote: string
) {
  if (!adminNote.trim()) {
    throw new Error("A rejection reason is required")
  }

  const submissionRes = await client.query<ManualPaymentSubmission>(
    `
    SELECT *
    FROM manual_payment_submissions
    WHERE id = $1
    FOR UPDATE
    `,
    [submissionId]
  )

  if (submissionRes.rowCount === 0) {
    return { ok: false as const, reason: "Submission not found" }
  }

  const submission = submissionRes.rows[0]

  if (submission.status !== "awaiting_confirmation") {
    return { ok: false as const, reason: "Submission is not awaiting confirmation" }
  }

  await client.query(
    `
    UPDATE manual_payment_submissions
    SET status = 'rejected',
        admin_note = $2,
        reviewed_by = $3,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    `,
    [submissionId, adminNote.trim(), adminUserId]
  )

  if (submission.payment_type === "shipment") {
    await resetShipmentAfterRejection(client, submission.reference)
  } else {
    await resetOrderAfterRejection(client, submission.reference)
  }

  await writeManualPaymentAudit(client, {
    submissionId,
    actorUserId: adminUserId,
    action: "rejected",
    details: { admin_note: adminNote.trim() },
  })

  return { ok: true as const }
}

export async function listManualPaymentSubmissions(
  status: string = "awaiting_confirmation"
) {
  const { pool } = await import("@/lib/db/db")

  const res = await pool.query<ManualPaymentSubmissionWithCustomer>(
    `
    SELECT
      m.*,
      u.email AS customer_email,
      u.first_name AS customer_first_name,
      u.last_name AS customer_last_name,
      c.code AS customer_code
    FROM manual_payment_submissions m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN customers c ON c.user_id = m.user_id
    WHERE m.status = $1
    ORDER BY m.created_at ASC
    `,
    [status]
  )

  return res.rows
}

export async function listManualPaymentSubmissionsPaged(params: {
  status?: string
  page: number
  pageSize: number
}) {
  const { pool } = await import("@/lib/db/db")

  const status = params.status ?? "awaiting_confirmation"
  const pageSize = Math.min(Math.max(1, Math.floor(params.pageSize)), 100)
  const page = Math.max(1, Math.floor(params.page))
  const offset = (page - 1) * pageSize

  const res = await pool.query<
    ManualPaymentSubmissionWithCustomer & { total_count: string }
  >(
    `
    SELECT
      m.*,
      u.email AS customer_email,
      u.first_name AS customer_first_name,
      u.last_name AS customer_last_name,
      c.code AS customer_code,
      COUNT(*) OVER()::text AS total_count
    FROM manual_payment_submissions m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN customers c ON c.user_id = m.user_id
    WHERE m.status = $1
    ORDER BY m.created_at ASC
    LIMIT $2
    OFFSET $3
    `,
    [status, pageSize, offset]
  )

  const total = Number(res.rows[0]?.total_count ?? 0)
  const rows = res.rows.map(({ total_count, ...row }) => row)

  return { rows, total, page, pageSize }
}

export async function countAwaitingManualPayments() {
  const { pool } = await import("@/lib/db/db")

  const res = await pool.query<{ count: string }>(
    `
    SELECT COUNT(*)::text AS count
    FROM manual_payment_submissions
    WHERE status = 'awaiting_confirmation'
    `
  )

  return Number(res.rows[0]?.count ?? 0)
}
