import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "session"

/** App areas that require a session cookie (full validation stays in layouts). */
const PROTECTED_PREFIXES = ["/customer", "/admin"] as const

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (isProtected && !sessionId) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/customer/:path*", "/admin/:path*"],
}
