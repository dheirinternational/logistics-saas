import pg from "pg"
import fs from "fs"

const envContent = fs.readFileSync(".env", "utf8")
const databaseUrlLine = envContent.split("\n").find(line => line.trim().startsWith("DATABASE_URL="))
const databaseUrl = databaseUrlLine ? databaseUrlLine.split("=")[1].trim().replace(/^['"]|['"]$/g, "") : null

if (!databaseUrl) {
  console.error("DATABASE_URL not found in .env")
  process.exit(1)
}

const { Pool } = pg
const pool = new Pool({ connectionString: databaseUrl })

async function run() {
  try {
    const res = await pool.query(
      `UPDATE warehouses SET phone = $1 WHERE phone = $2 RETURNING *`,
      ["+18813405374", "15920867629"]
    )
    console.log("Updated rows:", res.rows)
  } catch (err) {
    console.error("Failed to update database:", err)
  } finally {
    await pool.end()
  }
}

run()
