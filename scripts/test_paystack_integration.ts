import { pool } from "../lib/db/db"
import { verifyPaystackSignature } from "../lib/paystack/signature"
import { isPaystackPaymentPaid } from "../lib/paystack/verify"
import { resolvePaymentType } from "../lib/paystack/resolvePaymentType"
import {
  fulfillShipmentPayment,
  fulfillOrderPayment,
  markOrderPaymentFailed,
} from "../lib/paystack/fulfillment"
import crypto from "crypto"

async function runTests() {
  console.log("============================================================")
  console.log("PAYSTACK INTEGRATION TEST SUITE")
  console.log("============================================================")

  let passed = 0
  let failed = 0

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✔ PASS: ${msg}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${msg}`)
      failed++
    }
  }

  const client = await pool.connect()

  try {
    // 1. Signature Verification
    console.log("\n--- TEST 1: Paystack Signature Verification ---")
    const testSecret = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder"
    const sampleBody = JSON.stringify({ event: "charge.success", data: { reference: "TEST-REF-123" } })
    const validSignature = crypto.createHmac("sha512", testSecret).update(sampleBody).digest("hex")
    const invalidSignature = "invalid_signature_hash"

    assert(verifyPaystackSignature(sampleBody, validSignature) === true, "Valid signature correctly verified")
    assert(verifyPaystackSignature(sampleBody, invalidSignature) === false, "Invalid signature correctly rejected")

    // 2. Status check logic
    console.log("\n--- TEST 2: Paystack Status Checks ---")
    assert(isPaystackPaymentPaid("success") === true, "'success' is considered paid")
    assert(isPaystackPaymentPaid("Success") === true, "Case-insensitive 'Success' is considered paid")
    assert(isPaystackPaymentPaid("failed") === false, "'failed' is not considered paid")
    assert(isPaystackPaymentPaid("abandoned") === false, "'abandoned' is not considered paid")
    assert(isPaystackPaymentPaid(undefined) === false, "undefined is not considered paid")

    // 3. Database Shipment Payment Fulfillment
    console.log("\n--- TEST 3: Shipment Payment Fulfillment ---")
    const testShipmentRef = `TEST-SHIP-${Date.now()}`
    const testTracking = `TRK-${Date.now()}`

    // Insert dummy shipment and payment
    await client.query("BEGIN")
    await client.query(
      `INSERT INTO shipments (
        tracking_number, user_id, customer_code, origin_warehouse_id, destination_warehouse_id,
        channel, total_cost, payment_time, package_ids, total_weight_unit, paid_for, status
       )
       VALUES ($1, 40, 'Ronke-DHI0040', 8, 10, 'air', 15000, '', '{}', 'kg', false, 'pending')`,
      [testTracking]
    )
    await client.query(
      `INSERT INTO payments (user_id, customer_code, shipment_tracking_number, amount, status, transaction_ref, created_at)
       VALUES (40, 'Ronke-DHI0040', $1, 15000, 'pending', $2, NOW())`,
      [testTracking, testShipmentRef]
    )
    await client.query("COMMIT")

    // Verify resolvePaymentType resolves to shipment
    const resolvedType = await resolvePaymentType(testShipmentRef, client)
    assert(resolvedType === "shipment", `resolvePaymentType('${testShipmentRef}') correctly resolves to 'shipment'`)

    // Fulfill shipment payment
    await client.query("BEGIN")
    const fulfillShipResult = await fulfillShipmentPayment(client, testShipmentRef)
    await client.query("COMMIT")
    assert(fulfillShipResult.ok === true, "fulfillShipmentPayment returned ok")

    // Check payment and shipment updated
    const shipPaymentCheck = await client.query(
      `SELECT status, paid_at FROM payments WHERE transaction_ref = $1`,
      [testShipmentRef]
    )
    assert(shipPaymentCheck.rows[0]?.status === "paid", "Payment record updated to 'paid'")
    assert(shipPaymentCheck.rows[0]?.paid_at !== null, "Payment record has paid_at timestamp")

    const shipmentCheck = await client.query(
      `SELECT paid_for, status FROM shipments WHERE tracking_number = $1`,
      [testTracking]
    )
    assert(shipmentCheck.rows[0]?.paid_for === true, "Shipment paid_for updated to true")
    assert(shipmentCheck.rows[0]?.status === "processing", "Shipment status updated to 'processing'")

    // Clean up test shipment and payment
    await client.query(`DELETE FROM payments WHERE transaction_ref = $1`, [testShipmentRef])
    await client.query(`DELETE FROM shipments WHERE tracking_number = $1`, [testTracking])

    // 4. Database Order Payment Fulfillment & Failure
    console.log("\n--- TEST 4: Order Payment Fulfillment & Inventory Deduction ---")
    const testOrderId = `TEST-ORD-${Date.now()}`
    const testPaystackRef = `TEST-PAY-${Date.now()}`

    // Find or insert dummy product
    const prodRes = await client.query(`SELECT id, stock_quantity FROM products LIMIT 1`)
    if (prodRes.rows.length > 0) {
      const prod = prodRes.rows[0]
      const initialStock = Number(prod.stock_quantity)

      await client.query("BEGIN")
      await client.query(
        `INSERT INTO orders (order_id, user_id, customer_code, destination_address, total_price, payment_status, paystack_reference, status)
         VALUES ($1, 40, 'Ronke-DHI0040', '123 Test St, Lagos', 5000, 'pending', $2, 'Confirmed')`,
        [testOrderId, testPaystackRef]
      )
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price)
         VALUES ($1, $2, 'Test Product', 'https://example.com/test.jpg', 1, 5000)`,
        [testOrderId, prod.id]
      )
      await client.query("COMMIT")

      const orderType = await resolvePaymentType(testPaystackRef, client)
      assert(orderType === "order", `resolvePaymentType('${testPaystackRef}') correctly resolves to 'order'`)

      // Fulfill order
      await client.query("BEGIN")
      const fulfillOrderRes = await fulfillOrderPayment(client, testPaystackRef)
      await client.query("COMMIT")
      assert(fulfillOrderRes.ok === true, "fulfillOrderPayment returned ok")

      const orderCheck = await client.query(
        `SELECT payment_status, paid_at FROM orders WHERE order_id = $1`,
        [testOrderId]
      )
      assert(orderCheck.rows[0]?.payment_status === "paid", "Order payment_status updated to 'paid'")
      assert(orderCheck.rows[0]?.paid_at !== null, "Order has paid_at timestamp")

      const stockCheck = await client.query(`SELECT stock_quantity FROM products WHERE id = $1`, [prod.id])
      assert(
        Number(stockCheck.rows[0]?.stock_quantity) === initialStock - 1,
        `Inventory properly decremented from ${initialStock} to ${initialStock - 1}`
      )

      // Restore stock & cleanup order
      await client.query(`UPDATE products SET stock_quantity = $1 WHERE id = $2`, [initialStock, prod.id])
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [testOrderId])
      await client.query(`DELETE FROM orders WHERE order_id = $1`, [testOrderId])
    }

    // 5. Test Mark Order Payment Failed
    console.log("\n--- TEST 5: Order Payment Failed Status ---")
    const testFailOrderId = `TEST-FAIL-${Date.now()}`
    await client.query(
      `INSERT INTO orders (order_id, user_id, customer_code, destination_address, total_price, payment_status, paystack_reference, status)
       VALUES ($1, 40, 'Ronke-DHI0040', '123 Test St, Lagos', 3000, 'pending', $2, 'Confirmed')`,
      [testFailOrderId, testFailOrderId]
    )

    await client.query("BEGIN")
    await markOrderPaymentFailed(client, testFailOrderId)
    await client.query("COMMIT")

    const failCheck = await client.query(
      `SELECT payment_status FROM orders WHERE order_id = $1`,
      [testFailOrderId]
    )
    assert(failCheck.rows[0]?.payment_status === "failed", "Order payment_status updated to 'failed'")
    await client.query(`DELETE FROM orders WHERE order_id = $1`, [testFailOrderId])

  } catch (err) {
    console.error("Test execution error:", err)
    failed++
  } finally {
    client.release()
    await pool.end()
  }

  console.log("\n============================================================")
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
  console.log("============================================================")

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
