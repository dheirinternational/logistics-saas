import { cookies } from "next/headers"
import { randomUUID } from "crypto"
import { cache } from "react"
import { DatabaseUnavailableError, dbQuery, isTransientConnectionError, withDbRetry } from "./db"
import { pool } from "./db"
import { redirect } from "next/navigation"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "session"
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 4

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
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

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

    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })
    return null
  }

  return session
})

/** Clears the session cookie and removes the row from the database. */
export async function clearSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]).catch((err) => {
      console.error("clearSession delete failed:", err)
    })
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  })
}

export async function deleteSession() {
  await clearSession()
  redirect("/auth/login")
}
