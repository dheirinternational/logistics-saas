import { pool } from "@/lib/db/db"
import { loginErrorResponse } from "@/lib/db/loginErrors"
import { verifyPassword } from "@/lib/db/password"
import { createSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = String(body.email || "")
      .trim()
      .toLowerCase()
    const password = String(body.password || "").trim()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `
            SELECT id, email, password, salt, role FROM users
            WHERE email = $1
            LIMIT 1
        `,
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return NextResponse.json({ error: "Wrong Email" }, { status: 401 })
    }

    const isPasswordValid = await verifyPassword(password, user.salt, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Wrong Password" }, { status: 401 })
    }

    const role = String(user.role ?? "customer")
    await createSession(user.id, role)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role,
      },
    })
  } catch (error) {
    console.error("LOGIN ERROR", error)
    const { error: message, status } = loginErrorResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}