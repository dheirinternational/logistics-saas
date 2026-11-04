import { pool } from "../lib/db/db"

async function runE2ETests() {
  console.log("============================================================")
  console.log("INBOX REPLIES & THREADING E2E TEST SUITE")
  console.log("============================================================\n")

  const client = await pool.connect()
  let passedCount = 0
  let failedCount = 0

  function pass(msg: string) {
    console.log(`  ✔ PASS: ${msg}`)
    passedCount++
  }

  function fail(msg: string, err?: any) {
    console.error(`  ✖ FAIL: ${msg}`, err || "")
    failedCount++
  }

  // IDs to clean up
  const createdMessageIds: string[] = []

  try {
    // Find an admin and two test/active customers
    const adminRes = await client.query(
      `SELECT id, first_name, last_name, email FROM users WHERE role = 'admin' LIMIT 1`,
    )
    if (adminRes.rows.length === 0) throw new Error("No admin user found")
    const admin = adminRes.rows[0]

    const custRes = await client.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, cust.code 
       FROM users u 
       JOIN customers cust ON cust.user_id = u.id 
       WHERE u.role = 'customer' 
       ORDER BY u.id ASC 
       LIMIT 2`,
    )
    if (custRes.rows.length < 2) throw new Error("Need at least 2 customers for testing")
    const customerA = custRes.rows[0]
    const customerB = custRes.rows[1]

    console.log(`Using Admin: ${admin.email} (ID ${admin.id})`)
    console.log(`Using Customer A: ${customerA.email} (${customerA.code}, ID ${customerA.id})`)
    console.log(`Using Customer B: ${customerB.email} (${customerB.code}, ID ${customerB.id})\n`)

    // --- TEST 1: Admin sends direct message to Customer A ---
    console.log("--- TEST 1: Direct Message Creation & Inbox Visibility ---")
    const directRes = await client.query(
      `
      INSERT INTO inbox_messages (
        sender_id, recipient_id, sender_role, title, body, is_broadcast
      ) VALUES ($1, $2, 'admin', $3, $4, false)
      RETURNING id, thread_id, parent_id, sender_role
      `,
      [admin.id, customerA.id, "E2E Test: Shipment Arrival Notice", "Your packages arrived at the Lagos warehouse."],
    )
    const directRoot = directRes.rows[0]
    createdMessageIds.push(directRoot.id)

    if (directRoot.thread_id && directRoot.parent_id === null) {
      pass("Direct message created as thread root with thread_id assigned and parent_id null")
    } else {
      fail("Direct message thread_id or parent_id incorrect")
    }

    // Customer A checks inbox
    const custAInboxRes = await client.query(
      `
      SELECT id, title, body 
      FROM inbox_messages 
      WHERE (recipient_id = $1 OR is_broadcast = TRUE) 
        AND parent_id IS NULL
        AND id = $2
      `,
      [customerA.id, directRoot.id],
    )
    if (custAInboxRes.rows.length === 1) {
      pass("Customer A sees direct message in root inbox list")
    } else {
      fail("Direct message not visible in Customer A inbox")
    }

    // Customer B should NOT see Customer A's direct message
    const custBInboxRes = await client.query(
      `
      SELECT id 
      FROM inbox_messages 
      WHERE (recipient_id = $1 OR is_broadcast = TRUE) 
        AND parent_id IS NULL
        AND id = $2
      `,
      [customerB.id, directRoot.id],
    )
    if (custBInboxRes.rows.length === 0) {
      pass("Customer B cannot see Customer A private direct message")
    } else {
      fail("Customer B saw Customer A private direct message")
    }

    // --- TEST 2: Customer A replies to Direct Message ---
    console.log("\n--- TEST 2: Customer Reply to Direct Message ---")
    const replyRes = await client.query(
      `
      INSERT INTO inbox_messages (
        sender_id, recipient_id, sender_role, parent_id, thread_id, title, body, is_broadcast
      ) VALUES ($1, $2, 'customer', $3, $4, $5, $6, false)
      RETURNING id, sender_role, parent_id, thread_id
      `,
      [
        customerA.id,
        admin.id,
        directRoot.id,
        directRoot.thread_id,
        "Re: E2E Test: Shipment Arrival Notice",
        "Thanks! I will arrange pickup today.",
      ],
    )
    const custAReply = replyRes.rows[0]
    createdMessageIds.push(custAReply.id)

    if (custAReply.sender_role === "customer" && custAReply.parent_id === directRoot.id) {
      pass("Customer reply created with sender_role = 'customer' and parent_id set")
    } else {
      fail("Customer reply metadata mismatch")
    }

    // Verify reply does NOT clutter the customer's root inbox list
    const rootListWithReply = await client.query(
      `
      SELECT id FROM inbox_messages 
      WHERE (recipient_id = $1 OR is_broadcast = TRUE) 
        AND parent_id IS NULL 
        AND id = $2
      `,
      [customerA.id, custAReply.id],
    )
    if (rootListWithReply.rows.length === 0) {
      pass("Customer reply does not create duplicate root inbox item")
    } else {
      fail("Customer reply appeared in root inbox list")
    }

    // --- TEST 3: Thread Fetching ---
    console.log("\n--- TEST 3: Chronological Thread Fetching ---")
    const threadRes = await client.query(
      `
      SELECT id, body, sender_role, created_at
      FROM inbox_messages
      WHERE id = $1 OR parent_id = $1
      ORDER BY created_at ASC
      `,
      [directRoot.id],
    )
    if (threadRes.rows.length === 2) {
      pass("Thread query returns exactly 2 messages (root + reply)")
    } else {
      fail(`Expected 2 thread messages, got ${threadRes.rows.length}`)
    }

    if (threadRes.rows[0].sender_role === "admin" && threadRes.rows[1].sender_role === "customer") {
      pass("Thread ordered chronologically: Admin announcement first, Customer reply second")
    } else {
      fail("Thread chronological ordering failed")
    }

    // --- TEST 4: Admin Inquiries View & Reply ---
    console.log("\n--- TEST 4: Admin Inquiries View & Staff Response ---")
    const adminThreadsRes = await client.query(
      `
      WITH customer_conversations AS (
        SELECT
          COALESCE(root.id, m.id) AS root_id,
          COALESCE(root.title, m.title) AS root_title,
          COALESCE(root.is_broadcast, m.is_broadcast) AS is_broadcast,
          (CASE WHEN m.sender_role = 'customer' THEN m.sender_id ELSE m.recipient_id END) AS customer_id,
          m.id AS latest_message_id,
          m.body AS latest_body,
          m.sender_role AS latest_sender_role,
          m.created_at AS latest_created_at
        FROM inbox_messages m
        LEFT JOIN inbox_messages root ON root.id = m.parent_id
        WHERE m.sender_role = 'customer' OR m.parent_id IS NOT NULL
      )
      SELECT DISTINCT ON (c.root_id, c.customer_id)
        c.root_id,
        c.root_title,
        c.customer_id,
        c.latest_body,
        c.latest_sender_role,
        cust.code AS customer_code
      FROM customer_conversations c
      JOIN users u ON u.id = c.customer_id
      LEFT JOIN customers cust ON cust.user_id = u.id
      WHERE c.root_id = $1 AND c.customer_id = $2
      `,
      [directRoot.id, customerA.id],
    )

    if (adminThreadsRes.rows.length === 1 && adminThreadsRes.rows[0].customer_code === customerA.code) {
      pass("Admin inquiries query identifies Customer A thread with member code")
    } else {
      fail("Admin inquiries query failed to surface thread")
    }

    // Admin replies back to Customer A
    const adminReplyRes = await client.query(
      `
      INSERT INTO inbox_messages (
        sender_id, recipient_id, sender_role, parent_id, thread_id, title, body, is_broadcast
      ) VALUES ($1, $2, 'admin', $3, $4, $5, $6, false)
      RETURNING id, sender_role
      `,
      [
        admin.id,
        customerA.id,
        directRoot.id,
        directRoot.thread_id,
        "Re: E2E Test: Shipment Arrival Notice",
        "Sounds good! Our warehouse is open until 17:30.",
      ],
    )
    const adminReply = adminReplyRes.rows[0]
    createdMessageIds.push(adminReply.id)
    pass("Admin response recorded successfully in thread")

    // Full thread now has 3 messages
    const fullThreadRes = await client.query(
      `SELECT id FROM inbox_messages WHERE id = $1 OR parent_id = $1`,
      [directRoot.id],
    )
    if (fullThreadRes.rows.length === 3) {
      pass("Conversation thread now contains 3 messages in complete dialog")
    } else {
      fail(`Expected 3 messages in thread, found ${fullThreadRes.rows.length}`)
    }

    // --- TEST 5: Broadcast Privacy & Isolation ---
    console.log("\n--- TEST 5: Broadcast Reply Isolation & Data Privacy ---")
    // Admin creates a broadcast
    const broadcastRes = await client.query(
      `
      INSERT INTO inbox_messages (
        sender_id, recipient_id, sender_role, title, body, is_broadcast
      ) VALUES ($1, null, 'admin', $2, $3, true)
      RETURNING id, thread_id
      `,
      [admin.id, "E2E Broadcast: Independence Day Schedule", "Office will be closed on Thursday."],
    )
    const broadcast = broadcastRes.rows[0]
    createdMessageIds.push(broadcast.id)
    pass("Broadcast message created")

    // Customer A replies to the broadcast
    const custABroadcastReply = await client.query(
      `
      INSERT INTO inbox_messages (
        sender_id, recipient_id, sender_role, parent_id, thread_id, title, body, is_broadcast
      ) VALUES ($1, null, 'customer', $2, $3, $4, $5, false)
      RETURNING id
      `,
      [
        customerA.id,
        broadcast.id,
        broadcast.thread_id,
        "Re: E2E Broadcast: Independence Day Schedule",
        "Are you open on Friday?",
      ],
    )
    createdMessageIds.push(custABroadcastReply.rows[0].id)
    pass("Customer A replied to broadcast")

    // Customer B loads replies to this broadcast
    const custBRepliesToBroadcast = await client.query(
      `
      SELECT m.id, m.body
      FROM inbox_messages m
      WHERE m.parent_id = $1
        AND (m.sender_id = $2 OR m.recipient_id = $2)
      `,
      [broadcast.id, customerB.id],
    )
    if (custBRepliesToBroadcast.rows.length === 0) {
      pass("Customer B cannot see Customer A reply to public broadcast")
    } else {
      fail("Data leak! Customer B saw Customer A reply to broadcast")
    }

    // Customer A loads their replies to this broadcast
    const custARepliesToBroadcast = await client.query(
      `
      SELECT m.id, m.body
      FROM inbox_messages m
      WHERE m.parent_id = $1
        AND (m.sender_id = $2 OR m.recipient_id = $2)
      `,
      [broadcast.id, customerA.id],
    )
    if (custARepliesToBroadcast.rows.length === 1) {
      pass("Customer A sees their own private reply to the broadcast")
    } else {
      fail("Customer A cannot see their own reply to the broadcast")
    }

    // --- TEST 6: Read Receipts & Unread Count Scoping ---
    console.log("\n--- TEST 6: Read Receipts & Unread Count Scoping ---")
    // Mark direct message read for Customer A
    await client.query(
      `
      INSERT INTO inbox_read_receipts (message_id, user_id)
      SELECT m.id, $2
      FROM inbox_messages m
      WHERE m.id = $1 OR m.parent_id = $1
      ON CONFLICT (user_id, message_id) DO NOTHING
      `,
      [directRoot.id, customerA.id],
    )

    const unreadCountCustA = await client.query(
      `
      SELECT COUNT(*) AS count
      FROM inbox_messages m
      LEFT JOIN inbox_read_receipts r ON r.message_id = m.id AND r.user_id = $1
      WHERE m.id = $2 AND r.read_at IS NULL
      `,
      [customerA.id, directRoot.id],
    )
    if (Number(unreadCountCustA.rows[0].count) === 0) {
      pass("Read receipts properly marked thread messages as read")
    } else {
      fail("Message remained unread after read receipt insertion")
    }

  } finally {
    // Clean up test data
    console.log("\n--- Cleaning up test artifacts ---")
    if (createdMessageIds.length > 0) {
      await client.query(
        `DELETE FROM inbox_read_receipts WHERE message_id = ANY($1::uuid[])`,
        [createdMessageIds],
      )
      await client.query(
        `DELETE FROM inbox_messages WHERE id = ANY($1::uuid[]) OR parent_id = ANY($1::uuid[])`,
        [createdMessageIds],
      )
      console.log(`Cleaned up ${createdMessageIds.length} test messages and associated receipts.`)
    }
    client.release()
  }

  console.log("\n============================================================")
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log("============================================================")

  if (failedCount > 0) {
    process.exit(1)
  }
}

runE2ETests().catch((err) => {
  console.error("Test execution failed:", err)
  process.exit(1)
})
