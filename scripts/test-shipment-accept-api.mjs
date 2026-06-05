/**
 * Test POST /api/shipments (admin accept flow).
 * Usage: node scripts/test-shipment-accept-api.mjs [--keep]
 * Requires dev server on BASE_URL (default http://localhost:3000).
 */
import pg from "pg"
import { randomUUID } from "crypto"
import { readFileSync } from "fs"
import { resolve } from "path"

const { Pool } = pg
const keep = process.argv.includes("--keep")
const baseUrl = process.env.BASE_URL || "http://localhost:3000"

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8")
    for (const line of raw.split("\n")) {
      const t = line.trim()
      if (!t || t.startsWith("#")) continue
      const i = t.indexOf("=")
      if (i === -1) continue
      const key = t.slice(0, i)
      const val = t.slice(i + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    /* ignore */
  }
}

loadEnv()

const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
if (!dbUrl) {
  console.error("Set TEST_DATABASE_URL or DATABASE_URL")
  process.exit(1)
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
})

async function createAdminSession(adminId) {
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 4)
  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at, user_role) VALUES ($1, $2, $3, 'admin')`,
    [sessionId, adminId, expiresAt]
  )
  return sessionId
}

async function cleanupShipment(trackingNumber, requestId, packageIds) {
  await pool.query(`DELETE FROM payments WHERE shipment_tracking_number = $1`, [trackingNumber])
  await pool.query(
    `DELETE FROM shipment_images WHERE shipment_id = (SELECT id FROM shipments WHERE tracking_number = $1)`,
    [trackingNumber]
  )
  await pool.query(`DELETE FROM shipments WHERE tracking_number = $1`, [trackingNumber])
  await pool.query(`UPDATE shipment_requests SET status = 'pending' WHERE id = $1`, [requestId])
  await pool.query(
    `UPDATE packages SET status = 'requested_for' WHERE id = ANY($1::int[])`,
    [packageIds]
  )
}

async function main() {
  const health = await fetch(baseUrl).catch(() => null)
  if (!health?.ok) {
    console.error(`Dev server not reachable at ${baseUrl}`)
    process.exit(1)
  }

  const adminRes = await pool.query(
    `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`
  )
  const admin = adminRes.rows[0]
  if (!admin) {
    console.error("No admin user found")
    process.exit(1)
  }

  const reqRes = await pool.query(
    `SELECT id, customer_code, channel, user_id, payment_time, customer_note, package_ids, total_weight_unit
     FROM shipment_requests WHERE status = 'pending' ORDER BY id LIMIT 1`
  )
  const request = reqRes.rows[0]
  if (!request) {
    console.error("No pending shipment request to test")
    process.exit(1)
  }

  const mediaRes = await pool.query(`SELECT id FROM media_assets ORDER BY id LIMIT 1`)
  const mediaId = mediaRes.rows[0]?.id
  if (!mediaId) {
    console.error("No media assets in library")
    process.exit(1)
  }

  const packageIds = request.package_ids.map((id) => Number(id))
  const sessionId = await createAdminSession(admin.id)

  const form = new FormData()
  form.append("customer_code", request.customer_code)
  form.append("origin_warehouse_id", "1")
  form.append("destination_warehouse_id", "2")
  form.append("channel", request.channel)
  form.append("shipment_request_id", String(request.id))
  form.append("shipment_note", request.customer_note || "")
  form.append("user_id", String(request.user_id))
  form.append("payment_time", request.payment_time)
  form.append("package_ids", packageIds.join(","))
  form.append("total_price", "50000")
  form.append("total_weight", "12.50")
  form.append("total_weight_unit", request.total_weight_unit === "cbm" ? "cbm" : "kg")
  form.append("media_asset_ids", String(mediaId))

  console.log(`Testing POST /api/shipments`)
  console.log(`  Admin: ${admin.email}`)
  console.log(`  Request id: ${request.id} (${request.channel}, ${packageIds.length} packages)`)
  console.log(`  Media asset id: ${mediaId}`)
  console.log(`  Cleanup after test: ${keep ? "no (--keep)" : "yes"}\n`)

  const t0 = Date.now()
  const res = await fetch(`${baseUrl}/api/shipments`, {
    method: "POST",
    headers: { Cookie: `session=${sessionId}` },
    body: form,
  })
  const elapsed = Date.now() - t0
  const body = await res.json().catch(() => ({}))

  console.log(`Status: ${res.status} (${elapsed} ms)`)
  console.log("Response:", JSON.stringify(body, null, 2))

  await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId])

  if (!res.ok) {
    process.exit(1)
  }

  const tracking = body?.data?.tracking_number
  if (!tracking) {
    console.error("Missing tracking_number in success response")
    process.exit(1)
  }

  if (elapsed > 10000) {
    console.warn(`WARN: Request took ${elapsed}ms (>10s) — pool deadlock may still be present`)
  } else {
    console.log(`OK: Completed in ${elapsed}ms`)
  }

  if (!keep) {
    await cleanupShipment(tracking, request.id, packageIds)
    console.log(`Cleaned up test shipment ${tracking} and reverted request ${request.id}`)
  } else {
    console.log(`Left shipment ${tracking} in database (--keep)`)
  }

  await pool.end()
}

main().catch(async (err) => {
  console.error(err)
  await pool.end().catch(() => {})
  process.exit(1)
})
