import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/shipment-requests/[id]/vet
 * Admin only. Vets a shipment request.
 * Action can be 'accept' (changes status to 'vetted') or 'reject' (changes status to 'rejected',
 * sets rejection_note, and reverts package statuses back to 'stored').
 */
export async function POST(
  req: NextRequest,
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
    const body = await req.json()
    const { action, rejection_note } = body

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Must be 'accept' or 'reject'." },
        { status: 400 }
      )
    }

    const requestRes = await pool.query(
      "SELECT package_ids FROM shipment_requests WHERE id = $1",
      [id]
    )

    if (requestRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Shipment request not found." },
        { status: 404 }
      )
    }

    const packageIds = requestRes.rows[0].package_ids

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      if (action === "accept") {
        await client.query(
          "UPDATE shipment_requests SET status = 'vetted', rejection_note = NULL WHERE id = $1",
          [id]
        )
      } else {
        // reject
        await client.query(
          "UPDATE shipment_requests SET status = 'rejected', rejection_note = $2 WHERE id = $1",
          [id, rejection_note || "Request rejected by admin."]
        )
        // Revert packages back to 'stored'
        if (packageIds && packageIds.length > 0) {
          await client.query(
            "UPDATE packages SET status = 'stored' WHERE id = ANY($1)",
            [packageIds]
          )
        }
      }

      await client.query("COMMIT")
    } catch (txErr) {
      await client.query("ROLLBACK").catch(() => undefined)
      throw txErr
    } finally {
      client.release()
    }

    return NextResponse.json({
      success: true,
      message: `Shipment request successfully ${action === "accept" ? "accepted" : "rejected"}.`
    })

  } catch (err) {
    console.error("Error vetting shipment request", err)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}
