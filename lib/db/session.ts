import { cookies, headers } from "next/headers"
import { randomUUID } from "crypto"
import { cache } from "react"
import { DatabaseUnavailableError, dbQuery, isTransientConnectionError, withDbRetry } from "./db"
import { pool } from "./db"
import { redirect } from "next/navigation"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "session"
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 4
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Resolves the active session token from `Authorization: Bearer <token>` (mobile/API)
 * or falls back to the `session` HTTP-only cookie (web).
 */
async function resolveSessionId(): Promise<{
  sessionId: string | null
  source: "bearer" | "cookie" | null
}> {
  const headerStore = await headers()
  const authHeader = headerStore.get("authorization")
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i)
    const bearerToken = match?.[1]?.trim()
    if (bearerToken) {
      return {
        sessionId: UUID_REGEX.test(bearerToken) ? bearerToken : null,
        source: "bearer",
      }
    }
  }

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(SESSION_COOKIE_NAME)?.value?.trim()
  if (cookieToken) {
    return {
      sessionId: UUID_REGEX.test(cookieToken) ? cookieToken : null,
      source: "cookie",
    }
  }

  return { sessionId: null, source: null }
}

export async function createSession(userId: number, userRole: string = "customer") {
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await withDbRetry(
    () =>
      pool.query(
        `
        INSERT INTO sessions (id, user_id, expires_at, user_role)
        VALUES ($1, $2, $3, $4)
    `,
        [sessionId, userId, expiresAt, userRole]
      ),
    "createSession"
  )

  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return { sessionId, expiresAt }
}

export const getSession = cache(async () => {
  const { sessionId, source } = await resolveSessionId()

  if (!sessionId) return null

  let result
  try {
    result = await dbQuery(
      `
            SELECT
                sessions.id,
                sessions.user_id,
                sessions.expires_at,
                users.email,
                users.role,
                users.staff_role,
                users.first_name,
                users.last_name,
                users.profile_img
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.id = $1
            LIMIT 1
        `,
      [sessionId]
    )
  } catch (err) {
    console.error("getSession query failed:", err)
    if (isTransientConnectionError(err)) {
      throw new DatabaseUnavailableError()
    }
    throw err
  }

  const session = result.rows[0]

  if (!session) {
    return null
  }

  const expired = new Date(session.expires_at).getTime() < Date.now()

  if (expired) {
    await withDbRetry(
      () => pool.query(`DELETE FROM sessions where id = $1`, [sessionId]),
      "deleteExpiredSession"
    ).catch((err) => console.error("deleteExpiredSession failed:", err))

    if (source === "cookie") {
      try {
        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE_NAME, "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: new Date(0),
          path: "/",
        })
      } catch {
        // Ignore cookie mutation when getSession runs inside a Server Component render
      }
    }
    return null
  }

  return session
})

/** Clears the active session (Bearer or cookie) from the database and clears the cookie. */
export async function clearSession() {
  const { sessionId, source } = await resolveSessionId()

  if (sessionId) {
    await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]).catch((err) => {
      console.error("clearSession delete failed:", err)
    })
  }

  if (source !== "bearer") {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })
  }
}

export async function deleteSession() {
  await clearSession()
  redirect("/auth/login")
}
