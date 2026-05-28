/**
 * Hit DELETE /api/users/:id as an admin (real HTTP).
 * Usage: node scripts/test-user-delete-api.mjs [--commit]
 * Requires dev server on BASE_URL (default http://localhost:3000).
 */
import pg from "pg"
import { randomUUID } from "crypto"

const { Pool } = pg
const commit = process.argv.includes("--commit")
const baseUrl = process.env.BASE_URL || "http://localhost:3000"
const emails = ["umarsulaimant3ch1@gmail.com", "toyitimi@gmail.com"]

if (!process.env.TEST_DATABASE_URL) {
  console.error("Set TEST_DATABASE_URL from .env")
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
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

async function deleteUserViaApi(sessionId, userId) {
  const res = await fetch(`${baseUrl}/api/users/${userId}`, {
    method: "DELETE",
    headers: { Cookie: `session=${sessionId}` },
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, body }
}

async function main() {
  const lookup = await pool.query(
    `SELECT u.id, u.email, c.code, u.first_name, u.last_name
     FROM users u
     LEFT JOIN customers c ON c.user_id = u.id
     WHERE u.email = ANY($1::text[])`,
    [emails]
  )

  if (lookup.rows.length === 0) {
    console.error("Target users not found in database")
    process.exit(1)
  }

  const adminRes = await pool.query(
    `SELECT id, email FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`
  )
  const admin = adminRes.rows[0]
  if (!admin) {
    console.error("No admin user in database")
    process.exit(1)
  }

  console.log(`Admin session as ${admin.email} (id ${admin.id})`)
  console.log(`Mode: ${commit ? "COMMIT (permanent delete)" : "DRY RUN — pass --commit to delete"}`)
  console.log(`Base URL: ${baseUrl}\n`)

  if (!commit) {
    console.log("Targets found:")
    for (const row of lookup.rows) {
      console.log(`  id=${row.id} ${row.first_name} ${row.last_name} ${row.code} ${row.email}`)
    }
    console.log("\nRe-run with --commit to call DELETE API.")
    await pool.end()
    return
  }

  // Health check
  try {
    const ping = await fetch(`${baseUrl}/api/auth/me`, { method: "GET" })
    if (!ping) throw new Error("no response")
  } catch {
    console.error(`Dev server not reachable at ${baseUrl}. Start with: npm run dev`)
    process.exit(1)
  }

  const sessionId = await createAdminSession(admin.id)
  const results = []

  for (const row of lookup.rows) {
    console.log(`DELETE /api/users/${row.id} (${row.email})...`)
    const result = await deleteUserViaApi(sessionId, row.id)
    results.push({ row, result })
    console.log(`  → ${result.status} ${result.body.message ?? JSON.stringify(result.body)}`)
  }

  await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId])

  const failed = results.filter((r) => !r.result.ok)
  if (failed.length > 0) {
    console.error("\nFAILED:", failed.length)
    process.exit(1)
  }

  console.log("\nAll deletes succeeded.")
  const verify = await pool.query(
    `SELECT id, email FROM users WHERE email = ANY($1::text[])`,
    [emails]
  )
  console.log("Remaining rows with those emails:", verify.rows.length)

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
