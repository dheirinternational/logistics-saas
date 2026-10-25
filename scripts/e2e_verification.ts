import { Pool } from "pg"
import { randomUUID } from "crypto"
import React from "react"
import ReactDOMServer from "react-dom/server"
import { PortalRequestMailConfirmDialog } from "@/components/portal/packages/PortalRequestMailConfirmDialog"

let passed = 0
let failed = 0

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${msg}`)
    passed++
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${msg}`)
    failed++
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  const adminSessionId = "11111111-2222-3333-4444-555555555555"
  const user58SessionId = "55555555-5555-5555-5555-555555555555"
  const expiresAt = new Date(Date.now() + 3600000)

  try {
    await client.query(
      "INSERT INTO sessions (id, user_id, expires_at, user_role) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET expires_at = $3",
      [adminSessionId, 40, expiresAt, "admin"]
    )
    await client.query(
      "INSERT INTO sessions (id, user_id, expires_at, user_role) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET expires_at = $3",
      [user58SessionId, 58, expiresAt, "customer"]
    )

    console.log("\n============================================================")
    console.log("TEST SUITE 1: Database Schema & Shipment 100 Sea Cargo Fix")
    console.log("============================================================")
    const s100Res = await client.query("SELECT * FROM shipments WHERE id = 100")
    const s100 = s100Res.rows[0]
    assert(s100 !== undefined, "Shipment 100 found in DB")
    assert(Number(s100.sea_weight) === 0.14, `Shipment 100 sea_weight is 0.14 (got ${s100?.sea_weight})`)
    assert(s100.sea_weight_unit === "cbm", `Shipment 100 sea_weight_unit is 'cbm' (got ${s100?.sea_weight_unit})`)
    assert(Number(s100.sea_cost) === 72800, `Shipment 100 sea_cost is ₦72,800 (got ${s100?.sea_cost})`)
    assert(Number(s100.origin_warehouse_id) === 14, `Shipment 100 origin warehouse is Guangzhou Sea (14) (got ${s100?.origin_warehouse_id})`)
    assert(Number(s100.destination_warehouse_id) === 11, `Shipment 100 dest warehouse is Lagos Sea (11) (got ${s100?.destination_warehouse_id})`)
    assert(s100.channel === "sea", `Shipment 100 channel is 'sea' (got ${s100?.channel})`)

    const req71Res = await client.query("SELECT * FROM shipment_requests WHERE id = 71")
    const req71 = req71Res.rows[0]
    assert(req71 !== undefined, "Shipment Request 71 found in DB")
    assert(Number(req71.sea_weight) === 0.14, `Request 71 sea_weight is 0.14 (got ${req71?.sea_weight})`)
    assert(req71.sea_weight_unit === "cbm", `Request 71 sea_weight_unit is 'cbm' (got ${req71?.sea_weight_unit})`)
    assert(Number(req71.sea_cost) === 72800, `Request 71 sea_cost is ₦72,800 (got ${req71?.sea_cost})`)
    assert(req71.channel === "sea", `Request 71 channel is 'sea' (got ${req71?.channel})`)

    console.log("\n============================================================")
    console.log("TEST SUITE 2: Admin Shipment Creation API with Sea Cargo Breakdown")
    console.log("============================================================")
    const testReqRes = await client.query(`
      INSERT INTO shipment_requests (user_id, customer_code, channel, status, package_ids, created_at, total_weight, payment_time, customer_note, packaging)
      VALUES (40, 'Ronke-DHI0040', 'sea', 'vetted', ARRAY[1]::bigint[], NOW(), 0.85, 'pay_before_shipment', 'E2E test shipment note', 'Normal Standard Packaging')
      RETURNING id
    `)
    const testReqId = testReqRes.rows[0].id

    const fd = new FormData()
    fd.append("customer_code", "Ronke-DHI0040")
    fd.append("user_id", "40")
    fd.append("shipment_request_id", String(testReqId))
    fd.append("channel", "sea")
    fd.append("payment_time", "pay_before_shipment")
    fd.append("package_ids", "1")
    fd.append("total_weight", "0.85")
    fd.append("total_weight_unit", "cbm")
    fd.append("total_pieces", "4")
    fd.append("total_price", "280000")
    fd.append("loading_date", "2026-11-01")
    fd.append("expected_arrival_date", "2026-11-30")
    fd.append("sea_weight", "0.85")
    fd.append("sea_weight_unit", "cbm")
    fd.append("sea_cost", "280000")
    fd.append("sea_pieces", "4")
    fd.append("sea_loading_date", "2026-11-01")
    fd.append("sea_expected_arrival_date", "2026-11-30")
    fd.append("admin_reply", "Processed via Guangzhou Sea Freight")

    const createShipRes = await fetch("http://localhost:3005/api/shipments", {
      method: "POST",
      headers: { cookie: `session=${adminSessionId}` },
      body: fd,
    })
    const createShipData = await createShipRes.json()
    assert(createShipRes.status === 200, `POST /api/shipments returned 200 OK`)
    assert(createShipData.success === true, "Response success is true")
    const createdId = Number(createShipData.data.id)

    const shipDb = (await client.query("SELECT * FROM shipments WHERE id = $1", [createdId])).rows[0]
    assert(Number(shipDb.sea_weight) === 0.85, `DB sea_weight correctly stored as 0.85 (got ${shipDb.sea_weight})`)
    assert(shipDb.sea_weight_unit === "cbm", `DB sea_weight_unit correctly stored as 'cbm' (got ${shipDb.sea_weight_unit})`)
    assert(Number(shipDb.sea_cost) === 280000, `DB sea_cost correctly stored as 280,000 (got ${shipDb.sea_cost})`)
    assert(shipDb.sea_pieces === 4, `DB sea_pieces correctly stored as 4 (got ${shipDb.sea_pieces})`)
    assert(Number(shipDb.origin_warehouse_id) === 14, `Origin warehouse automatically set to Guangzhou Sea (14) (got ${shipDb.origin_warehouse_id})`)
    assert(Number(shipDb.destination_warehouse_id) === 11, `Destination warehouse automatically set to Lagos Sea (11) (got ${shipDb.destination_warehouse_id})`)
    assert(shipDb.channel === "sea", `Shipment channel is 'sea' (got ${shipDb.channel})`)

    const reqDb = (await client.query("SELECT * FROM shipment_requests WHERE id = $1", [testReqId])).rows[0]
    assert(reqDb.status === "accepted", `Request status updated to 'accepted' (got ${reqDb.status})`)
    assert(Number(reqDb.sea_cost) === 280000, `Request sea_cost stored as 280,000 (got ${reqDb.sea_cost})`)
    assert(Number(reqDb.sea_weight) === 0.85, `Request sea_weight stored as 0.85 (got ${reqDb.sea_weight})`)

    // Clean up created test shipment
    await client.query("DELETE FROM payments WHERE shipment_tracking_number = $1", [createShipData.data.tracking_number])
    await client.query("DELETE FROM shipments WHERE id = $1", [createdId])
    await client.query("DELETE FROM shipment_requests WHERE id = $1", [testReqId])

    console.log("\n============================================================")
    console.log("TEST SUITE 3: Customer Portal API Endpoints (Tracking & Shipments)")
    console.log("============================================================")
    const trackRes = await fetch("http://localhost:3005/api/portal/tracking?filter=all", {
      headers: { cookie: `session=${user58SessionId}` },
    })
    const trackJson = await trackRes.json()
    assert(trackRes.status === 200, "GET /api/portal/tracking returned 200 OK")
    const track100 = trackJson.data?.shipments?.find((s: any) => s.trackingNumber === "DHI-20261010-DOOXJZ")
    assert(track100 !== undefined, "Shipment 100 found in customer tracking response")
    assert(track100?.channel === "sea", `Tracking channel is 'sea' (got ${track100?.channel})`)
    assert(track100?.seaWeight === 0.14, `Tracking seaWeight is 0.14 (got ${track100?.seaWeight})`)
    assert(track100?.seaWeightUnit === "cbm", `Tracking seaWeightUnit is 'cbm' (got ${track100?.seaWeightUnit})`)
    assert(track100?.seaCost === 72800, `Tracking seaCost is ₦72,800 (got ${track100?.seaCost})`)
    assert(track100?.seaPieces === 2, `Tracking seaPieces is 2 (got ${track100?.seaPieces})`)

    const userShipRes = await fetch("http://localhost:3005/api/shipments/user", {
      headers: { cookie: `session=${user58SessionId}` },
    })
    const userShipJson = await userShipRes.json()
    assert(userShipRes.status === 200, "GET /api/shipments/user returned 200 OK")
    const userShip100 = userShipJson.data?.find((s: any) => s.id === 100 || s.id === "100")
    assert(userShip100 !== undefined, "Shipment 100 found in /api/shipments/user")
    assert(Number(userShip100?.sea_weight) === 0.14, `userShip sea_weight is 0.14 (got ${userShip100?.sea_weight})`)
    assert(userShip100?.sea_weight_unit === "cbm", `userShip sea_weight_unit is 'cbm' (got ${userShip100?.sea_weight_unit})`)
    assert(Number(userShip100?.sea_cost) === 72800, `userShip sea_cost is ₦72,800 (got ${userShip100?.sea_cost})`)
    assert(userShip100?.origin_warehouse_name?.includes("Sea Cargo"), `Origin warehouse is Sea Cargo (got ${userShip100?.origin_warehouse_name})`)
    assert(userShip100?.destination_warehouse_name?.includes("Sea Cargo"), `Destination warehouse is Sea Cargo (got ${userShip100?.destination_warehouse_name})`)

    console.log("\n============================================================")
    console.log("TEST SUITE 4: Air Shipping Prepaid Notice & Mandatory Acknowledgment")
    console.log("============================================================")
    // 4a. Verify HTML of request_mail page contains the prepaid notice
    const reqMailRes = await fetch("http://localhost:3005/customer/request_mail", {
      headers: { cookie: `session=${adminSessionId}` },
    })
    const reqMailHtml = await reqMailRes.text()
    assert(reqMailRes.status === 200, "GET /customer/request_mail returned 200 OK")
    assert(reqMailHtml.includes("Air shipping is strictly prepaid"), "request_mail displays: '(Air shipping is strictly prepaid)' badge")

    // 4b. Mount PortalRequestMailConfirmDialog with shippingMethod='air' and open=true
    const dialogHtmlAir = ReactDOMServer.renderToString(
      React.createElement(PortalRequestMailConfirmDialog, {
        open: true,
        submitting: false,
        shippingMethod: "air",
        onClose: () => {},
        onSubmit: async () => {},
      })
    )
    assert(dialogHtmlAir.includes("Important Air Shipping Requirements"), "Dialog contains header '⚠️ Important Air Shipping Requirements'")
    assert(dialogHtmlAir.includes("The minimum acceptable billing weight for Air cargo is"), "Dialog explains minimum weight policy (1kg)")
    assert(dialogHtmlAir.includes("Air shipping is prepaid, which means you must pay the shipping fee before your goods are shipped out from China"), "Dialog explains prepaid requirement")
    assert(dialogHtmlAir.includes("I understand that Air shipping is strictly prepaid and minimum weight is 1kg"), "Dialog renders mandatory acknowledgment checkbox")

    // 4c. Verify for sea channel, the air-specific warning is NOT shown
    const dialogHtmlSea = ReactDOMServer.renderToString(
      React.createElement(PortalRequestMailConfirmDialog, {
        open: true,
        submitting: false,
        shippingMethod: "sea",
        onClose: () => {},
        onSubmit: async () => {},
      })
    )
    assert(!dialogHtmlSea.includes("Important Air Shipping Requirements"), "Sea request dialog does not show air prepaid warning")

    console.log("\n============================================================")
    console.log("TEST SUITE 5: Customer Dashboard & Tracking SSR Display")
    console.log("============================================================")
    const custHomeRes = await fetch("http://localhost:3005/customer", {
      headers: { cookie: `session=${user58SessionId}` },
    })
    const custHomeHtml = await custHomeRes.text()
    assert(custHomeRes.status === 200, "GET /customer returned 200 OK")
    assert(custHomeHtml.includes("Cargo Breakdown:"), "Customer home displays 'Cargo Breakdown:' (not 'Flight Breakdown')")
    assert(custHomeHtml.includes("Sea Cargo:"), "Customer home displays 'Sea Cargo:'")
    assert(custHomeHtml.includes("0.14 CBM") || custHomeHtml.includes("0.14"), "Customer home displays volume '0.14 CBM'")
    assert(custHomeHtml.includes("72,800"), "Customer home displays price '₦72,800'")

    console.log("\n============================================================")
    console.log("TEST SUITE 6: Status Types & Package Status Verification")
    console.log("============================================================")
    const { getShipmentStatusLabel, getShipmentStatusVariant } = require("@/lib/portal/packageStatus")
    assert(getShipmentStatusLabel("pending_payment") === "Pending payment", "getShipmentStatusLabel('pending_payment') returns 'Pending payment'")
    assert(getShipmentStatusVariant("pending_payment") === "orange", "getShipmentStatusVariant('pending_payment') returns 'orange'")

    await client.query("DELETE FROM sessions WHERE id IN ($1, $2)", [adminSessionId, user58SessionId])

    console.log("\n============================================================")
    console.log(`ALL E2E VERIFICATION COMPLETED: \x1b[32m${passed} PASSED\x1b[0m, \x1b[31m${failed} FAILED\x1b[0m`)
    console.log("============================================================\n")

    if (failed > 0) {
      process.exit(1)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error("E2E Test Execution Error:", err)
  process.exit(1)
})
