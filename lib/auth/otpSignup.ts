import { getClientIp } from "@/lib/auth/clientIp"
import { isValidEmail, normalizeEmail } from "@/lib/auth/email"
import { markSignupEmailVerified } from "@/lib/auth/signupVerification"
import { pool } from "@/lib/db/db"
import { sendSignupOtpEmail } from "@/lib/mails/sendSignupOtpEmail"

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_SENDS_PER_EMAIL_PER_HOUR = 5
const MAX_SENDS_PER_IP_PER_HOUR = 15
const MAX_VERIFY_ATTEMPTS = 5

export type SendOtpResult =
  | { ok: true; retryAfterSeconds: number }
  | { ok: false; status: number; message: string; retryAfterSeconds?: number }

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; status: number; message: string }

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function otpMatches(stored: string | number, submitted: string): boolean {
  const a = String(stored).padStart(6, "0")
  const b = String(submitted).trim().replace(/\D/g, "").padStart(6, "0").slice(-6)
  return a.length === 6 && b.length === 6 && a === b
}

async function countRecentSends(
  email: string,
  ip: string,
  windowMs: number
): Promise<{ emailCount: number; ipCount: number }> {
  const since = new Date(Date.now() - windowMs)
  const [byEmail, byIp] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS c FROM otp_send_log WHERE email = $1 AND created_at > $2`,
      [email, since]
    ),
    ip === "unknown"
      ? Promise.resolve({ rows: [{ c: 0 }] })
      : pool.query(
          `SELECT COUNT(*)::int AS c FROM otp_send_log WHERE ip = $1 AND created_at > $2`,
          [ip, since]
        ),
  ])
  return {
    emailCount: byEmail.rows[0]?.c ?? 0,
    ipCount: byIp.rows[0]?.c ?? 0,
  }
}

export async function sendSignupOtp(
  request: Request,
  rawEmail: string
): Promise<SendOtpResult> {
  const email = normalizeEmail(rawEmail)
  const ip = getClientIp(request)

  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "Enter a valid email address" }
  }

  const existingUser = await pool.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [email]
  )
  if ((existingUser.rowCount ?? 0) > 0) {
    return {
      ok: false,
      status: 409,
      message: "An account with this email already exists. Log in instead.",
    }
  }

  const { emailCount, ipCount } = await countRecentSends(
    email,
    ip,
    60 * 60 * 1000
  )
  if (emailCount >= MAX_SENDS_PER_EMAIL_PER_HOUR) {
    return {
      ok: false,
      status: 429,
      message: "Too many codes sent to this email. Try again in about an hour.",
      retryAfterSeconds: 3600,
    }
  }
  if (ipCount >= MAX_SENDS_PER_IP_PER_HOUR) {
    return {
      ok: false,
      status: 429,
      message: "Too many requests from your network. Try again later.",
      retryAfterSeconds: 3600,
    }
  }

  const existingOtp = await pool.query(
    `SELECT created_at FROM otp WHERE email = $1`,
    [email]
  )
  if (existingOtp.rows.length > 0) {
    const created = new Date(existingOtp.rows[0].created_at).getTime()
    const elapsed = Date.now() - created
    if (elapsed < RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
      return {
        ok: false,
        status: 429,
        message: `Please wait ${retryAfterSeconds} seconds before requesting another code.`,
        retryAfterSeconds,
      }
    }
  }

  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await pool.query(
    `
    INSERT INTO otp (email, value, expires_at, created_at, attempts)
    VALUES ($1, $2, $3, NOW(), 0)
    ON CONFLICT (email)
    DO UPDATE SET
      value = EXCLUDED.value,
      expires_at = EXCLUDED.expires_at,
      created_at = NOW(),
      attempts = 0
    `,
    [email, otp, expiresAt]
  )

  await pool.query(
    `INSERT INTO otp_send_log (email, ip) VALUES ($1, $2)`,
    [email, ip]
  )

  await sendSignupOtpEmail(email, otp)

  return { ok: true, retryAfterSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000) }
}

export async function verifySignupOtp(
  rawEmail: string,
  rawOtp: string
): Promise<VerifyOtpResult> {
  const email = normalizeEmail(rawEmail)
  const otp = String(rawOtp ?? "").trim()

  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "Enter a valid email address" }
  }

  if (!/^\d{6}$/.test(otp.replace(/\s/g, ""))) {
    return { ok: false, status: 400, message: "Enter the 6-digit code from your email" }
  }

  const existingUser = await pool.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [email]
  )
  if ((existingUser.rowCount ?? 0) > 0) {
    return {
      ok: false,
      status: 409,
      message: "An account with this email already exists. Log in instead.",
    }
  }

  const { rows } = await pool.query(
    `SELECT value, expires_at, attempts FROM otp WHERE email = $1`,
    [email]
  )

  if (rows.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "No code found for this email. Request a new code.",
    }
  }

  const record = rows[0]
  const attempts = Number(record.attempts ?? 0)

  if (attempts >= MAX_VERIFY_ATTEMPTS) {
    await pool.query(`DELETE FROM otp WHERE email = $1`, [email])
    return {
      ok: false,
      status: 429,
      message: "Too many incorrect attempts. Request a new code.",
    }
  }

  if (new Date() > new Date(record.expires_at)) {
    await pool.query(`DELETE FROM otp WHERE email = $1`, [email])
    return {
      ok: false,
      status: 400,
      message: "This code has expired. Request a new one.",
    }
  }

  if (!otpMatches(record.value, otp)) {
    await pool.query(`UPDATE otp SET attempts = attempts + 1 WHERE email = $1`, [
      email,
    ])
    const remaining = MAX_VERIFY_ATTEMPTS - attempts - 1
    return {
      ok: false,
      status: 400,
      message:
        remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
          : "Incorrect code.",
    }
  }

  await pool.query(`DELETE FROM otp WHERE email = $1`, [email])
  await markSignupEmailVerified(email)

  return { ok: true }
}
