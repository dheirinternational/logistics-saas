import { pool } from "@/lib/db/db"

/**
 * Ensures a customer record and unique member code exists for a given user.
 * Self-heals any account that was created without a customers entry.
 */
export async function ensureCustomerCode(
  userId: number,
  firstName?: string | null,
): Promise<string> {
  const existing = await pool.query(
    `SELECT code FROM customers WHERE user_id = $1 LIMIT 1`,
    [userId]
  )
  if (existing.rows.length > 0 && existing.rows[0].code?.trim()) {
    return existing.rows[0].code.trim()
  }

  const cleanFirst = (firstName || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .trim()
  const prefix = cleanFirst || "CUST"
  const baseCode = `${prefix}-DHI${String(userId).padStart(4, "0")}`

  let finalCode = baseCode
  let suffix = 1

  while (true) {
    const codeCheck = await pool.query(
      `SELECT id FROM customers WHERE code = $1 AND user_id != $2 LIMIT 1`,
      [finalCode, userId]
    )
    if (codeCheck.rows.length === 0) {
      break
    }
    finalCode = `${baseCode}-${suffix}`
    suffix++
  }

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE customers SET code = $1 WHERE user_id = $2`,
      [finalCode, userId]
    )
  } else {
    await pool.query(
      `INSERT INTO customers (user_id, code) VALUES ($1, $2)`,
      [userId, finalCode]
    )
  }

  return finalCode
}
