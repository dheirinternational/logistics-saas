import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { isAdminOrStaff } from "@/lib/rbac/permissions"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/shipment-requests/[id]/vet
 * Admin/Staff only. Vets a shipment request or rejects an individual package.
 * Actions:
 * - 'accept': changes status to 'vetted'
 * - 'reject': changes status to 'rejected', sets rejection_note, and reverts all packages to 'stored'
 * - 'reject_package': rejects and detaches a single package from the request, restores it to 'stored',
 *   and notifies the customer with the explanation reason.
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

    if (!isAdminOrStaff(session)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { action, rejection_note, admin_reply, package_id, reason } = body

    if (!["accept", "reject", "reject_package"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Must be 'accept', 'reject', or 'reject_package'." },
        { status: 400 }
      )
    }

    const requestRes = await pool.query(
      "SELECT user_id, customer_code, package_ids FROM shipment_requests WHERE id = $1",
      [id]
    )

    if (requestRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Shipment request not found." },
        { status: 404 }
      )
    }

    const { user_id: customerUserId, package_ids: packageIds } = requestRes.rows[0]

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      if (action === "reject_package") {
        const pkgIdNum = Number(package_id)
        if (!pkgIdNum) {
          throw new Error("package_id is required for reject_package action")
        }

        const pkgRes = await client.query(
          "SELECT id, incoming_package_id, package_name, weight, weight_unit FROM packages WHERE id = $1",
          [pkgIdNum]
        )
        const pkg = pkgRes.rows[0] || {
          incoming_package_id: String(pkgIdNum),
          package_name: "Package",
          weight: 0,
          weight_unit: "kg",
        }

        // Restore package status to 'stored'
        await client.query(
          "UPDATE packages SET status = 'stored' WHERE id = $1",
          [pkgIdNum]
        )

        // Remove package from request package_ids array
        const currentIds: number[] = Array.isArray(packageIds) ? packageIds.map(Number) : []
        const remainingIds = currentIds.filter((p) => p !== pkgIdNum)

        if (remainingIds.length === 0) {
          await client.query(
            "UPDATE shipment_requests SET package_ids = $1, status = 'rejected', rejection_note = $2 WHERE id = $3",
            [remainingIds, reason || "All packages in request were rejected or restored.", id]
          )
        } else {
          await client.query(
            "UPDATE shipment_requests SET package_ids = $1 WHERE id = $2",
            [remainingIds, id]
          )
        }

        // Notify customer via inbox
        if (customerUserId) {
          const noteText = [
            `Package: ${pkg.package_name} (${pkg.incoming_package_id})`,
            `Weight: ${pkg.weight || 0} ${pkg.weight_unit || "kg"}`,
            `Reason: ${reason || "Notice from China warehouse: item cannot be dispatched."}`,
            "Status: Restored to your available warehouse inventory. You can view it in your Packages section.",
          ].join("\n")

          await client.query(
            `INSERT INTO inbox_messages (sender_id, recipient_id, title, body, is_broadcast)
             VALUES ($1, $2, $3, $4, false)`,
            [
              session.user_id,
              customerUserId,
              `Package ${pkg.incoming_package_id} Restored to Inventory`,
              noteText,
            ]
          )
        }

        await client.query("COMMIT")
        return NextResponse.json({
          success: true,
          message: `Package ${pkg.incoming_package_id} removed from shipment request and restored to customer inventory.`,
          remainingCount: remainingIds.length,
        })
      }

      if (action === "accept") {
        await client.query(
          "UPDATE shipment_requests SET status = 'vetted', rejection_note = NULL, admin_reply = $2 WHERE id = $1",
          [id, admin_reply || null]
        )

        if (admin_reply && admin_reply.trim() && customerUserId) {
          await client.query(
            `INSERT INTO inbox_messages (sender_id, recipient_id, title, body, is_broadcast)
             VALUES ($1, $2, $3, $4, false)`,
            [
              session.user_id,
              customerUserId,
              `Shipment Request #${id} Vetted & Accepted`,
              admin_reply.trim(),
            ]
          )
        }
      } else {
        // reject
        await client.query(
          "UPDATE shipment_requests SET status = 'rejected', rejection_note = $2, admin_reply = $3 WHERE id = $1",
          [id, rejection_note || "Request rejected by admin.", admin_reply || null]
        )
        // Revert packages back to 'stored'
        if (packageIds && packageIds.length > 0) {
          await client.query(
            "UPDATE packages SET status = 'stored' WHERE id = ANY($1)",
            [packageIds]
          )
        }

        if (customerUserId) {
          const reasonText = [
            rejection_note ? `Reason: ${rejection_note.trim()}` : "",
            admin_reply ? `Note: ${admin_reply.trim()}` : "",
          ]
            .filter(Boolean)
            .join("\n")

          await client.query(
            `INSERT INTO inbox_messages (sender_id, recipient_id, title, body, is_broadcast)
             VALUES ($1, $2, $3, $4, false)`,
            [
              session.user_id,
              customerUserId,
              `Shipment Request #${id} Rejected`,
              reasonText || "Your shipment request was rejected by admin.",
            ]
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
