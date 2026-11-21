import { DatabaseUnavailableError } from "@/lib/db/db"
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
        staff_role: session.staff_role ?? null,
        first_name: session.first_name ?? null,
        last_name: session.last_name ?? null,
        profile_img: session.profile_img ?? null,
      },
    })
  } catch (err) {
    console.error("auth/me error", err)
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { user: null, error: err.message },
        { status: 503 }
      )
    }
    const { error: message, status } = loginErrorResponse(err)
    return NextResponse.json({ user: null, error: message }, { status })
  }
}