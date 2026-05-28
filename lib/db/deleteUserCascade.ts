import type { PoolClient } from "pg"
import type { DatabaseError } from "pg"

type UserDeleteContext = {
  userId: number
  email: string
  customerCode: string | null
}

export class UserDeleteError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly detail?: string
  ) {
    super(message)
    this.name = "UserDeleteError"
  }
}

/**
 * Run a delete that may fail if the table was never migrated in.
 * Uses a SAVEPOINT so a missing table (42P01) does not abort the whole transaction.
 */
async function optionalDelete(
  client: PoolClient,
  sql: string,
  params: unknown[] = []
): Promise<void> {
  await client.query("SAVEPOINT optional_delete")
  try {
    await client.query(sql, params)
    await client.query("RELEASE SAVEPOINT optional_delete")
  } catch (err) {
    await client.query("ROLLBACK TO SAVEPOINT optional_delete")
    const dbErr = err as DatabaseError
    if (dbErr.code === "42P01") return
    throw err
  }
}

/**
 * Removes manual payment rows and audit history for a user before orders/payments/shipments are deleted.
 */
export async function deleteManualPaymentsForUser(
  client: PoolClient,
  userId: number,
  customerCode: string | null
): Promise<void> {
  await client.query(
    `UPDATE manual_payment_submissions SET reviewed_by = NULL WHERE reviewed_by = $1`,
    [userId]
  )
  await client.query(
    `UPDATE manual_payment_audit_log SET actor_user_id = NULL WHERE actor_user_id = $1`,
    [userId]
  )

  const orderScope = customerCode
    ? `(user_id = $1 OR customer_code = $2)`
    : `user_id = $1`
  const orderParams = customerCode ? [userId, customerCode] : [userId]

  const shipmentScope = customerCode
    ? `(user_id = $1 OR customer_code = $2)`
    : `user_id = $1`

  await client.query(
    `DELETE FROM manual_payment_audit_log
     WHERE submission_id IN (
       SELECT id FROM manual_payment_submissions
       WHERE user_id = $1
          OR (
            payment_type = 'order'
            AND reference IN (SELECT order_id FROM orders WHERE ${orderScope})
          )
          OR (
            payment_type = 'shipment'
            AND reference IN (
              SELECT transaction_ref FROM payments
              WHERE user_id = $1
                 OR shipment_tracking_number IN (
                   SELECT tracking_number FROM shipments WHERE ${shipmentScope}
                 )
                 ${customerCode ? "OR customer_code = $2" : ""}
            )
          )
     )`,
    customerCode ? [userId, customerCode] : [userId]
  )

  await client.query(
    `DELETE FROM manual_payment_submissions
     WHERE user_id = $1
        OR (
          payment_type = 'order'
          AND reference IN (SELECT order_id FROM orders WHERE ${orderScope})
        )
        OR (
          payment_type = 'shipment'
          AND reference IN (
            SELECT transaction_ref FROM payments
            WHERE user_id = $1
               OR shipment_tracking_number IN (
                 SELECT tracking_number FROM shipments WHERE ${shipmentScope}
               )
               ${customerCode ? "OR customer_code = $2" : ""}
          )
        )`,
    customerCode ? [userId, customerCode] : [userId]
  )
}

export async function deleteSessionsForUser(
  client: PoolClient,
  userId: number
): Promise<void> {
  await client.query(`DELETE FROM sessions WHERE user_id = $1`, [userId])
}

export async function deleteEmailVerificationForUser(
  client: PoolClient,
  email: string
): Promise<void> {
  const normalized = email.trim().toLowerCase()
  await optionalDelete(
    client,
    `DELETE FROM signup_email_verifications WHERE email = $1`,
    [normalized]
  )
  await optionalDelete(client, `DELETE FROM otp_send_log WHERE email = $1`, [normalized])
  await optionalDelete(client, `DELETE FROM otp WHERE email = $1`, [normalized])
}

async function clearOrdersUpdatedBy(client: PoolClient, userId: number): Promise<void> {
  await client.query(
    `UPDATE orders SET updated_by = NULL WHERE updated_by IS NOT NULL AND updated_by::text = $1::text`,
    [String(userId)]
  )
}

/** Marketplace products: created_by is NOT NULL — delete rows; updated_by can be cleared. */
async function deleteProductsOwnedByUser(
  client: PoolClient,
  userId: number
): Promise<void> {
  const productScope = `SELECT id FROM products WHERE created_by = $1`

  await client.query(
    `DELETE FROM order_items WHERE product_id IN (${productScope})`,
    [userId]
  )
  await client.query(
    `DELETE FROM product_images WHERE product_id IN (${productScope})`,
    [userId]
  )
  await client.query(`DELETE FROM products WHERE created_by = $1`, [userId])
  await client.query(`UPDATE products SET updated_by = NULL WHERE updated_by = $1`, [userId])
}

/**
 * Deletes a user and every row linked by user_id or customer code (verified FK graph).
 */
export async function deleteUserCascade(
  client: PoolClient,
  userId: number
): Promise<void> {
  const userRow = await client.query<{ email: string }>(
    `SELECT email FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  )
  if (userRow.rows.length === 0) {
    throw new UserDeleteError("User not found")
  }

  const customerRes = await client.query<{ code: string }>(
    `SELECT code FROM customers WHERE user_id = $1 LIMIT 1`,
    [userId]
  )
  const ctx: UserDeleteContext = {
    userId,
    email: userRow.rows[0].email,
    customerCode: customerRes.rows[0]?.code ?? null,
  }

  const { customerCode } = ctx
  const uid = userId

  await deleteManualPaymentsForUser(client, uid, customerCode)
  await clearOrdersUpdatedBy(client, uid)

  if (customerCode) {
    await client.query(
      `DELETE FROM package_images
       WHERE package_id IN (
         SELECT id FROM packages WHERE user_id = $1 OR customer_code = $2
       )`,
      [uid, customerCode]
    )
    await client.query(
      `DELETE FROM order_items
       WHERE order_id IN (
         SELECT order_id FROM orders WHERE user_id = $1 OR customer_code = $2
       )`,
      [uid, customerCode]
    )
    await client.query(
      `DELETE FROM payments
       WHERE user_id = $1
          OR customer_code = $2
          OR shipment_tracking_number IN (
            SELECT tracking_number FROM shipments
            WHERE user_id = $1 OR customer_code = $2
          )`,
      [uid, customerCode]
    )
    await client.query(`DELETE FROM orders WHERE user_id = $1 OR customer_code = $2`, [
      uid,
      customerCode,
    ])
    await client.query(
      `DELETE FROM shipment_images
       WHERE shipment_id IN (
         SELECT id FROM shipments WHERE user_id = $1 OR customer_code = $2
       )`,
      [uid, customerCode]
    )
    await client.query(`DELETE FROM shipments WHERE user_id = $1 OR customer_code = $2`, [
      uid,
      customerCode,
    ])
    await client.query(
      `DELETE FROM shipment_requests WHERE user_id = $1 OR customer_code = $2`,
      [uid, customerCode]
    )
    await client.query(
      `DELETE FROM incoming_packages WHERE user_id = $1 OR customer_code = $2`,
      [uid, customerCode]
    )
    await client.query(`DELETE FROM packages WHERE user_id = $1 OR customer_code = $2`, [
      uid,
      customerCode,
    ])
    await deleteProductsOwnedByUser(client, uid)
  } else {
    await client.query(
      `DELETE FROM package_images WHERE package_id IN (SELECT id FROM packages WHERE user_id = $1)`,
      [uid]
    )
    await client.query(
      `DELETE FROM order_items
       WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = $1)`,
      [uid]
    )
    await client.query(
      `DELETE FROM payments
       WHERE user_id = $1
          OR shipment_tracking_number IN (
            SELECT tracking_number FROM shipments WHERE user_id = $1
          )`,
      [uid]
    )
    await client.query(`DELETE FROM orders WHERE user_id = $1`, [uid])
    await client.query(
      `DELETE FROM shipment_images
       WHERE shipment_id IN (SELECT id FROM shipments WHERE user_id = $1)`,
      [uid]
    )
    await client.query(`DELETE FROM shipments WHERE user_id = $1`, [uid])
    await client.query(`DELETE FROM shipment_requests WHERE user_id = $1`, [uid])
    await client.query(`DELETE FROM incoming_packages WHERE user_id = $1`, [uid])
    await client.query(`DELETE FROM packages WHERE user_id = $1`, [uid])
    await deleteProductsOwnedByUser(client, uid)
  }

  await client.query(`DELETE FROM addresses WHERE user_id = $1`, [uid])
  await optionalDelete(client, `DELETE FROM reviews WHERE user_id = $1`, [uid])
  await optionalDelete(client, `DELETE FROM notifications WHERE user_id = $1`, [uid])
  await optionalDelete(client, `DELETE FROM staff WHERE user_id = $1`, [uid])
  await optionalDelete(client, `DELETE FROM admins WHERE user_id = $1`, [uid])
  await deleteSessionsForUser(client, uid)
  await deleteEmailVerificationForUser(client, ctx.email)

  if (customerCode) {
    await client.query(`DELETE FROM customers WHERE code = $1`, [customerCode])
  } else {
    await client.query(`DELETE FROM customers WHERE user_id = $1`, [uid])
  }

  const deleteUserRes = await client.query(`DELETE FROM users WHERE id = $1`, [uid])
  if (deleteUserRes.rowCount === 0) {
    throw new UserDeleteError("User not found")
  }
}
