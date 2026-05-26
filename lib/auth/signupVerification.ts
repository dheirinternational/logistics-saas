import { pool } from "@/lib/db/db"
import { normalizeEmail } from "@/lib/auth/email"

/** How long a verified email may be used to complete registration */
export const SIGNUP_VERIFICATION_TTL_MS = 30 * 60 * 1000

export async function markSignupEmailVerified(email: string): Promise<void> {
  const normalized = normalizeEmail(email)
  const expiresAt = new Date(Date.now() + SIGNUP_VERIFICATION_TTL_MS)

  await pool.query(
    `
    INSERT INTO signup_email_verifications (email, verified_at, expires_at)
    VALUES ($1, NOW(), $2)
    ON CONFLICT (email)
    DO UPDATE SET
      verified_at = NOW(),
      expires_at = EXCLUDED.expires_at
    `,
    [normalized, expiresAt]
  )
}

/** Returns true only if a fresh server-side verification exists; consumes it. */
export async function consumeSignupEmailVerification(
  email: string
): Promise<boolean> {
  const normalized = normalizeEmail(email)

  const { rows } = await pool.query(
    `
    DELETE FROM signup_email_verifications
    WHERE email = $1 AND expires_at > NOW()
    RETURNING email
    `,
    [normalized]
  )

  return rows.length > 0
}

export async function clearSignupEmailVerification(email: string): Promise<void> {
  await pool.query(`DELETE FROM signup_email_verifications WHERE email = $1`, [
    normalizeEmail(email),
  ])
}
