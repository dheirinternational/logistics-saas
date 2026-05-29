import { pool } from "@/lib/db/db"
import { deleteUserCascade, UserDeleteError } from "@/lib/db/deleteUserCascade"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"
import type { DatabaseError, PoolClient } from "pg"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    const { id } = await params

    const res = await pool.query(
      `
            SELECT id, email, first_name, last_name, phone, role, created_at FROM users
            WHERE id = $1
            LIMIT 1    
        `,
      [id]
    )

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Error! Data does not exist" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: res.rows[0],
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("ERROR FETCHING USER DATA", err)
    return NextResponse.json({
      success: false,
      message: "Error fetching user Data",
    })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: PoolClient | null = null
  let began = false

  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const userId = Number(id)

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 })
    }

    if (session.user_id === userId) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own admin account." },
        { status: 400 }
      )
    }

    client = await pool.connect()
    await client.query("BEGIN")
    began = true

    await deleteUserCascade(client, userId)

    await client.query("COMMIT")

    return NextResponse.json({ success: true, message: "User deleted" })
  } catch (err) {
    if (client && began) {
      await client.query("ROLLBACK").catch(() => undefined)
    }

    if (err instanceof UserDeleteError) {
      const status = err.message === "User not found" ? 404 : 400
      return NextResponse.json({ success: false, message: err.message }, { status })
    }

    const dbError = err as DatabaseError
    console.error("ERROR DELETING USER", {
      code: dbError.code,
      constraint: dbError.constraint,
      detail: dbError.detail,
      message: dbError.message,
    })

    if (dbError?.code === "23503") {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete user: linked records still exist (${dbError.constraint ?? "foreign key"}).`,
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message:
          dbError?.message?.trim() ||
          "Error deleting user. User may still have linked records.",
      },
      { status: 500 }
    )
  } finally {
    client?.release()
  }
}
