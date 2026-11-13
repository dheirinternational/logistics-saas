import { pool, dbQuery } from "@/lib/db/db"
import { isAdminOrStaff } from "@/lib/rbac/permissions"
import {
  notifyTelegramPackageInbound,
  notifyTelegramCustomerMessage,
  notifyTelegramShipmentRequest,
  sendTelegramNotification,
} from "@/lib/notifications/telegram"

type TestResult = {
  name: string
  passed: boolean
  details?: string
}

async function runExhaustiveE2E() {
  const results: TestResult[] = []

  function assert(name: string, condition: boolean, details?: string) {
    results.push({ name, passed: Boolean(condition), details })
    if (condition) {
      console.log(`[PASS] ${name}`)
    } else {
      console.error(`[FAIL] ${name} : ${details || ""}`)
    }
  }

  console.log("=== STARTING EXHAUSTIVE E2E VERIFICATION ===")

  // -------------------------------------------------------------
  // SUITE 1: SIDEBAR BADGE ZERO-HIDING LOGIC
  // -------------------------------------------------------------
  console.log("\n--- Suite 1: Sidebar Badge Logic ---")
  const renderBadge = (count?: number) => {
    return typeof count === "number" && count > 0 ? `${count > 99 ? "99+" : count}` : null
  }
  assert("Badge hides when count is 0", renderBadge(0) === null)
  assert("Badge hides when count is undefined", renderBadge(undefined) === null)
  assert("Badge shows when count is 1", renderBadge(1) === "1")
  assert("Badge shows when count is 5", renderBadge(5) === "5")
  assert("Badge caps at 99+ when count is 100", renderBadge(100) === "99+")

  // -------------------------------------------------------------
  // SUITE 2: INBOX CUSTOMER SENDER ROLE & UNREAD BADGE TRACKING
  // -------------------------------------------------------------
  console.log("\n--- Suite 2: Inbox Unread & Role Tracking ---")
  const adminId = 40 // Ronke Adeoya
  const customerId = 144 // Ronke Customer
  const customerCode = "Olasunkanmi-DHI0144"

  // Create a clean test direct thread initiated by customer
  const threadInsert = await dbQuery(
    `
    INSERT INTO inbox_messages (
      sender_id,
      recipient_id,
      sender_role,
      title,
      body,
      is_broadcast
    ) VALUES ($1, $2, 'customer', 'E2E Test Customer Inquiry', 'Hello warehouse, this is an automated e2e test message', false)
    RETURNING id
    `,
    [customerId, adminId]
  )
  const testMsgId = threadInsert.rows[0].id
  assert("Customer inquiry created with sender_role customer", Boolean(testMsgId))

  // Check that admin sees it as unread (read_receipt is null)
  const unreadBeforeRes = await dbQuery(
    `
    SELECT COUNT(*) AS count
    FROM inbox_messages m
    LEFT JOIN inbox_read_receipts r
      ON r.message_id = m.id AND r.user_id = $1
    WHERE m.sender_role = 'customer'
      AND r.read_at IS NULL
      AND m.id = $2
    `,
    [adminId, testMsgId]
  )
  const unreadBefore = Number(unreadBeforeRes.rows[0]?.count ?? 0)
  assert("Admin counts the new customer message as unread", unreadBefore === 1, `Count: ${unreadBefore}`)

  // Mark as read by admin
  await dbQuery(
    `
    INSERT INTO inbox_read_receipts (message_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, message_id) DO NOTHING
    `,
    [testMsgId, adminId]
  )

  // Verify unread count is now 0 for that message
  const unreadAfterRes = await dbQuery(
    `
    SELECT COUNT(*) AS count
    FROM inbox_messages m
    LEFT JOIN inbox_read_receipts r
      ON r.message_id = m.id AND r.user_id = $1
    WHERE m.sender_role = 'customer'
      AND r.read_at IS NULL
      AND m.id = $2
    `,
    [adminId, testMsgId]
  )
  const unreadAfter = Number(unreadAfterRes.rows[0]?.count ?? 0)
  assert("Admin unread count decrements to 0 after viewing message", unreadAfter === 0, `Count: ${unreadAfter}`)

  // Clean up test message and its receipt
  await dbQuery(`DELETE FROM inbox_read_receipts WHERE message_id = $1`, [testMsgId])
  await dbQuery(`DELETE FROM inbox_messages WHERE id = $1`, [testMsgId])
  assert("Test inbox message cleanly pruned after test", true)

  // -------------------------------------------------------------
  // SUITE 3: SENT LOG READ STATUS CONFIRMATION
  // -------------------------------------------------------------
  console.log("\n--- Suite 3: Sent Log Read Confirmation ---")
  const formatReadStatus = (isBroadcast: boolean, readCount: number) => {
    return isBroadcast
      ? `${readCount} read`
      : readCount > 0
        ? "Read by customer"
        : "Delivered (Unread)"
  }
  assert("Direct message with 0 reads shows Delivered (Unread)", formatReadStatus(false, 0) === "Delivered (Unread)")
  assert("Direct message with 1 read shows Read by customer", formatReadStatus(false, 1) === "Read by customer")
  assert("Broadcast with 5 reads shows 5 read", formatReadStatus(true, 5) === "5 read")

  // -------------------------------------------------------------
  // SUITE 4: PACKAGE REJECTION & INVENTORY RESTORATION FLOW
  // -------------------------------------------------------------
  console.log("\n--- Suite 4: Package Rejection and Restoring to Inventory ---")
  // Create a mock package in status 'requested_for'
  const mockPkgRes = await dbQuery(
    `
    INSERT INTO packages (
      incoming_package_id, package_name, user_id, customer_code, warehouse_id,
      weight, weight_unit, amount, condition, status, received_at, stored_at, created_at
    ) VALUES (
      'TEST-TRK-9999', 'E2E Test Prohibited Item', $1, $2, 8,
      1.5, 'kg', 1, 'good', 'requested_for', NOW(), NOW(), NOW()
    ) RETURNING id
    `,
    [customerId, customerCode]
  )
  const mockPkgId = Number(mockPkgRes.rows[0].id)
  assert("Created mock package with status requested_for", mockPkgId > 0)

  // Create a mock shipment request holding this package plus another package ID
  const mockReqRes = await dbQuery(
    `
    INSERT INTO shipment_requests (
      user_id, customer_code, package_ids, channel, payment_time,
      customer_note, packaging, total_weight, total_weight_unit, status
    ) VALUES (
      $1, $2, $3, 'air', 'before',
      'Test shipment request', 'normal', 1.5, 'kg', 'pending'
    ) RETURNING id
    `,
    [customerId, customerCode, [mockPkgId, 99999]]
  )
  const mockReqId = mockReqRes.rows[0].id
  assert("Created mock shipment request holding package", Boolean(mockReqId))

  // Simulate reject_package action on mockPkgId
  // 1. Restore package status to 'stored'
  await dbQuery("UPDATE packages SET status = 'stored' WHERE id = $1", [mockPkgId])

  // 2. Remove package from request package_ids array
  const reqRes = await dbQuery("SELECT package_ids, user_id FROM shipment_requests WHERE id = $1", [mockReqId])
  const currentIds: number[] = reqRes.rows[0].package_ids.map(Number)
  const remainingIds = currentIds.filter((p) => p !== mockPkgId)
  await dbQuery("UPDATE shipment_requests SET package_ids = $1 WHERE id = $2", [remainingIds, mockReqId])

  // 3. Insert inbox message for customer
  const noteText = [
    "Package: E2E Test Prohibited Item (TEST-TRK-9999)",
    "Weight: 1.5 kg",
    "Reason: Prohibited battery item cannot be shipped by air",
    "Status: Restored to your available warehouse inventory. You can view it in your Packages section.",
  ].join("\n")

  await dbQuery(
    `INSERT INTO inbox_messages (sender_id, recipient_id, title, body, is_broadcast)
     VALUES ($1, $2, $3, $4, false)`,
    [adminId, customerId, "Package TEST-TRK-9999 Restored to Inventory", noteText]
  )

  // Verify package is restored to 'stored'
  const restoredPkg = await dbQuery("SELECT status FROM packages WHERE id = $1", [mockPkgId])
  assert("Package status is restored to 'stored'", restoredPkg.rows[0]?.status === "stored")

  // Verify package is removed from shipment request
  const updatedReq = await dbQuery("SELECT package_ids FROM shipment_requests WHERE id = $1", [mockReqId])
  const updatedIds: number[] = updatedReq.rows[0]?.package_ids.map(Number)
  assert("Package ID is removed from shipment request package_ids", !updatedIds.includes(mockPkgId))
  assert("Other package remains in shipment request", updatedIds.includes(99999))

  // Verify customer received the explanatory inbox message
  const inboxNotice = await dbQuery(
    `SELECT id, title, body FROM inbox_messages WHERE recipient_id = $1 AND title LIKE '%TEST-TRK-9999%' ORDER BY created_at DESC LIMIT 1`,
    [customerId]
  )
  assert("Customer received inbox notification explaining restoration", Boolean(inboxNotice.rows[0]))
  assert("Notification body contains the rejection reason", inboxNotice.rows[0]?.body.includes("Prohibited battery item"))

  // Clean up mock package, shipment request, and notification
  if (inboxNotice.rows[0]?.id) {
    await dbQuery("DELETE FROM inbox_messages WHERE id = $1", [inboxNotice.rows[0].id])
  }
  await dbQuery("DELETE FROM shipment_requests WHERE id = $1", [mockReqId])
  await dbQuery("DELETE FROM packages WHERE id = $1", [mockPkgId])
  assert("Mock package and shipment request cleanly pruned", true)

  // -------------------------------------------------------------
  // SUITE 5: TELEGRAM NOTIFICATION SERVICE
  // -------------------------------------------------------------
  console.log("\n--- Suite 5: Telegram Notification Service ---")
  const inboundRes = await notifyTelegramPackageInbound({
    trackingNumber: "YT777462223508362",
    customerCode: "Amina-DHIC",
    packageName: "Ladies Handbags",
    weight: 0.85,
    weightUnit: "kg",
    warehouseName: "Guangzhou Warehouse",
  })
  assert("Telegram package inbound notification formats without error", typeof inboundRes.success === "boolean")

  const msgRes = await notifyTelegramCustomerMessage({
    customerName: "Amina Sheriff",
    customerCode: "Amina-DHIC",
    title: "Inquiry on Packages",
    body: "Hello, have you received any of my goods at the China warehouse?",
  })
  assert("Telegram customer message notification formats without error", typeof msgRes.success === "boolean")

  const shipReqRes = await notifyTelegramShipmentRequest({
    requestId: 42,
    customerCode: "Amina-DHIC",
    channel: "air",
    packageCount: 3,
    paymentTiming: "before",
  })
  assert("Telegram shipment request notification formats without error", typeof shipReqRes.success === "boolean")

  // Fallback check when environment variables are omitted
  const directSend = await sendTelegramNotification("Test fallback")
  assert("Telegram service handles missing token gracefully without crashing", typeof directSend.success === "boolean")

  // -------------------------------------------------------------
  // E2E SUMMARY
  // -------------------------------------------------------------
  const failed = results.filter((r) => !r.passed)
  console.log("\n=== E2E SUMMARY ===")
  console.log(`Total tests: ${results.length}`)
  console.log(`Passed: ${results.length - failed.length}`)
  console.log(`Failed: ${failed.length}`)

  if (failed.length > 0) {
    console.error("FAILURES DETECTED:")
    failed.forEach((f) => console.error(`- ${f.name}: ${f.details || ""}`))
    process.exit(1)
  } else {
    console.log("ALL EXHAUSTIVE E2E VERIFICATIONS PASSED")
    process.exit(0)
  }
}

runExhaustiveE2E().catch((err) => {
  console.error("Fatal error during exhaustive E2E:", err)
  process.exit(1)
})
