/**
 * Dry-run or execute user delete cascade for debugging.
 * Usage:
 *   TEST_DATABASE_URL="$(grep '^TEST_DATABASE_URL=' .env | cut -d= -f2-)" node scripts/test-user-delete.mjs 39 40
 * Add --commit to actually delete (default is rollback after test).
 */
import pg from "pg"

const { Pool } = pg
const ids = process.argv.slice(2).filter((a) => a !== "--commit").map(Number)
const commit = process.argv.includes("--commit")

if (!process.env.TEST_DATABASE_URL) {
  console.error("Set TEST_DATABASE_URL from .env")
  process.exit(1)
}
if (ids.length === 0) {
  console.error("Pass one or more user ids, e.g. node scripts/test-user-delete.mjs 39 40")
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function optionalDelete(client, sql, params = []) {
  await client.query("SAVEPOINT optional_delete")
  try {
    await client.query(sql, params)
    await client.query("RELEASE SAVEPOINT optional_delete")
  } catch (err) {
    await client.query("ROLLBACK TO SAVEPOINT optional_delete")
    if (err.code !== "42P01") throw err
  }
}

async function deleteUserCascade(client, userId) {
  const userRow = await client.query(`SELECT email FROM users WHERE id = $1`, [userId])
  if (!userRow.rows[0]) throw new Error(`User ${userId} not found`)

  const customerRes = await client.query(
    `SELECT code FROM customers WHERE user_id = $1 LIMIT 1`,
    [userId]
  )
  const customerCode = customerRes.rows[0]?.code ?? null
  const uid = userId

  await client.query(
    `UPDATE manual_payment_submissions SET reviewed_by = NULL WHERE reviewed_by = $1`,
    [uid]
  )
  await client.query(
    `UPDATE manual_payment_audit_log SET actor_user_id = NULL WHERE actor_user_id = $1`,
    [uid]
  )

  const orderScope = customerCode ? `(user_id = $1 OR customer_code = $2)` : `user_id = $1`
  const shipmentScope = customerCode ? `(user_id = $1 OR customer_code = $2)` : `user_id = $1`
  const mpParams = customerCode ? [uid, customerCode] : [uid]

  await client.query(
    `DELETE FROM manual_payment_audit_log WHERE submission_id IN (
      SELECT id FROM manual_payment_submissions WHERE user_id = $1
        OR (payment_type = 'order' AND reference IN (SELECT order_id FROM orders WHERE ${orderScope}))
        OR (payment_type = 'shipment' AND reference IN (
          SELECT transaction_ref FROM payments WHERE user_id = $1
            OR shipment_tracking_number IN (SELECT tracking_number FROM shipments WHERE ${shipmentScope})
            ${customerCode ? "OR customer_code = $2" : ""}
        ))
    )`,
    mpParams
  )
  await client.query(
    `DELETE FROM manual_payment_submissions WHERE user_id = $1
      OR (payment_type = 'order' AND reference IN (SELECT order_id FROM orders WHERE ${orderScope}))
      OR (payment_type = 'shipment' AND reference IN (
        SELECT transaction_ref FROM payments WHERE user_id = $1
          OR shipment_tracking_number IN (SELECT tracking_number FROM shipments WHERE ${shipmentScope})
          ${customerCode ? "OR customer_code = $2" : ""}
      ))`,
    mpParams
  )

  await client.query(
    `UPDATE orders SET updated_by = NULL WHERE updated_by IS NOT NULL AND updated_by::text = $1::text`,
    [String(uid)]
  )
  if (customerCode) {
    await client.query(
      `DELETE FROM package_images WHERE package_id IN (SELECT id FROM packages WHERE user_id = $1 OR customer_code = $2)`,
      [uid, customerCode]
    )
    await client.query(
      `DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = $1 OR customer_code = $2)`,
      [uid, customerCode]
    )
    await client.query(
      `DELETE FROM payments WHERE user_id = $1 OR customer_code = $2
        OR shipment_tracking_number IN (SELECT tracking_number FROM shipments WHERE user_id = $1 OR customer_code = $2)`,
      [uid, customerCode]
    )
    await client.query(`DELETE FROM orders WHERE user_id = $1 OR customer_code = $2`, [uid, customerCode])
    await client.query(
      `DELETE FROM shipment_images WHERE shipment_id IN (SELECT id FROM shipments WHERE user_id = $1 OR customer_code = $2)`,
      [uid, customerCode]
    )
    await client.query(`DELETE FROM shipments WHERE user_id = $1 OR customer_code = $2`, [uid, customerCode])
    await client.query(`DELETE FROM shipment_requests WHERE user_id = $1 OR customer_code = $2`, [
      uid,
      customerCode,
    ])
    await client.query(`DELETE FROM incoming_packages WHERE user_id = $1 OR customer_code = $2`, [
      uid,
      customerCode,
    ])
    await client.query(`DELETE FROM packages WHERE user_id = $1 OR customer_code = $2`, [uid, customerCode])
    await client.query(
      `DELETE FROM order_items WHERE product_id IN (SELECT id FROM products WHERE created_by = $1)`,
      [uid]
    )
    await client.query(
      `DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE created_by = $1)`,
      [uid]
    )
    await client.query(`DELETE FROM products WHERE created_by = $1`, [uid])
    await client.query(`UPDATE products SET updated_by = NULL WHERE updated_by = $1`, [uid])
  } else {
    await client.query(
      `DELETE FROM package_images WHERE package_id IN (SELECT id FROM packages WHERE user_id = $1)`,
      [uid]
    )
    await client.query(
      `DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = $1)`,
      [uid]
    )
    await client.query(
      `DELETE FROM payments WHERE user_id = $1 OR shipment_tracking_number IN (
        SELECT tracking_number FROM shipments WHERE user_id = $1)`,
      [uid]
    )
    await client.query(`DELETE FROM orders WHERE user_id = $1`, [uid])
    await client.query(
      `DELETE FROM shipment_images WHERE shipment_id IN (SELECT id FROM shipments WHERE user_id = $1)`,
      [uid]
    )
    await client.query(`DELETE FROM shipments WHERE user_id = $1`, [uid])
    await client.query(`DELETE FROM shipment_requests WHERE user_id = $1`, [uid])
    await client.query(`DELETE FROM incoming_packages WHERE user_id = $1`, [uid])
    await client.query(`DELETE FROM packages WHERE user_id = $1`, [uid])
    await client.query(
      `DELETE FROM order_items WHERE product_id IN (SELECT id FROM products WHERE created_by = $1)`,
      [uid]
    )
    await client.query(
      `DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE created_by = $1)`,
      [uid]
    )
    await client.query(`DELETE FROM products WHERE created_by = $1`, [uid])
    await client.query(`UPDATE products SET updated_by = NULL WHERE updated_by = $1`, [uid])
  }

  await client.query(`DELETE FROM addresses WHERE user_id = $1`, [uid])
  await optionalDelete(client, `DELETE FROM reviews WHERE user_id = $1`, [uid])
  await optionalDelete(client, `DELETE FROM notifications WHERE user_id = $1`, [uid])
  await optionalDelete(client, `DELETE FROM staff WHERE user_id = $1`, [uid])
  await optionalDelete(client, `DELETE FROM admins WHERE user_id = $1`, [uid])
  await client.query(`DELETE FROM sessions WHERE user_id = $1`, [uid])
  const email = userRow.rows[0].email.trim().toLowerCase()
  await optionalDelete(client, `DELETE FROM signup_email_verifications WHERE email = $1`, [email])
  await optionalDelete(client, `DELETE FROM otp_send_log WHERE email = $1`, [email])
  await optionalDelete(client, `DELETE FROM otp WHERE email = $1`, [email])
  if (customerCode) {
    await client.query(`DELETE FROM customers WHERE code = $1`, [customerCode])
  } else {
    await client.query(`DELETE FROM customers WHERE user_id = $1`, [uid])
  }
  await client.query(`DELETE FROM users WHERE id = $1`, [uid])
}

for (const userId of ids) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    console.log(`\n--- user ${userId} (${commit ? "COMMIT" : "ROLLBACK"}) ---`)
    await deleteUserCascade(client, userId)
    if (commit) {
      await client.query("COMMIT")
      console.log(`OK deleted user ${userId}`)
    } else {
      await client.query("ROLLBACK")
      console.log(`OK cascade for user ${userId} (rolled back)`)
    }
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {})
    console.error(`FAIL user ${userId}:`, err.code, err.constraint, err.message, err.detail)
  } finally {
    client.release()
  }
}

await pool.end()
