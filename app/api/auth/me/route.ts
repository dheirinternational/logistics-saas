import { loginErrorResponse } from "@/lib/db/loginErrors"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: session.user_id,
        email: session.email,
        role: session.role,
      },
    })
  } catch (err) {
    console.error("auth/me error", err)
    const { error: message, status } = loginErrorResponse(err)
    return NextResponse.json({ user: null, error: message }, { status })
  }
}