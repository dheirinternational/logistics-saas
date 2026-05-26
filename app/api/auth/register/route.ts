import { isValidEmail, normalizeEmail } from "@/lib/auth/email"
import { consumeSignupEmailVerification } from "@/lib/auth/signupVerification"
import { pool } from "@/lib/db/db"
import { hashPassword } from "@/lib/db/password"
import { createSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

const PASSWORD_LENGTH = 7

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = normalizeEmail(String(body.email || ""))
    const password = String(body.password || "")
    const firstName = String(body.first_name || "").trim()
    const lastName = String(body.last_name || "").trim()
    const phone = String(body.phone || "").trim()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address" },
        { status: 400 }
      )
    }

    if (password.length < PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Password must be at least ${PASSWORD_LENGTH} characters long`,
        },
        { status: 400 }
      )
    }

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { success: false, message: "First name, last name, and phone are required" },
        { status: 400 }
      )
    }

    const verified = await consumeSignupEmailVerification(email)
    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verify your email with the code we sent before creating your account.",
        },
        { status: 403 }
      )
    }

    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [email]
    )

    if ((existingUser.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const { hash, salt } = await hashPassword(password)

    const result = await pool.query(
      `
      INSERT INTO users (email, password, salt, first_name, last_name, phone, created_at, role, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'customer', TRUE)
      RETURNING id, email
      `,
      [email, hash, salt, firstName, lastName, phone]
    )

    const user = result.rows[0]

    await pool.query(
      `
      INSERT INTO customers (user_id, code)
      VALUES ($1, $2)
      `,
      [user.id, `${firstName}-DHI${String(user.id).padStart(4, "0")}`]
    )

    await createSession(user.id, "customer")

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created account",
        data: {
          user: {
            id: user.id,
            email,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("register error", error)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}
