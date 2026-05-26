import { pool } from "@/lib/db/db"
import { formatWarehouseCopyText } from "@/lib/portal/warehouseAddress"

export type PortalDashboardCounts = {
  waiting_to_be_stored: number
  total_packages: number
  request_mail: number
  shipment: number
  pending_payments: number
}

export type PortalDashboardData = {
  firstName: string
  lastName: string
  memberCode: string
  counts: PortalDashboardCounts
  announcements: { id: string; title: string; message: string }[]
  warehouse: {
    id: number
    name: string
    copyText: string
  } | null
}

export async function getPortalDashboardData(
  userId: number,
): Promise<PortalDashboardData> {
  const [userRes, countsRes, announcementsRes, warehouseRes] = await Promise.all([
    pool.query(
      `
      SELECT u.first_name, u.last_name, c.code
      FROM users u
      JOIN customers c ON u.id = c.user_id
      WHERE u.id = $1
      `,
      [userId],
    ),
    pool.query(
      `
      SELECT
        (SELECT COUNT(*)::int FROM incoming_packages
          WHERE status != 'stored' AND user_id = $1) AS waiting_to_be_stored,
        (SELECT COUNT(*)::int FROM packages
          WHERE status != 'assigned_to_shipment' AND user_id = $1) AS total_packages,
        (SELECT COUNT(*)::int FROM shipment_requests
          WHERE status != 'accepted' AND user_id = $1) AS request_mail,
        (SELECT COUNT(*)::int FROM shipments
          WHERE status != 'delivered' AND user_id = $1) AS shipment,
        (SELECT COUNT(*)::int FROM payments
          WHERE status = 'pending' AND user_id = $1) AS pending_payments
      `,
      [userId],
    ),
    pool.query(
      `
      SELECT id, title, message
      FROM announcements
      ORDER BY id DESC
      LIMIT 3
      `,
    ),
    pool.query(
      `
      SELECT id, name, country, province, city, district, street, building, phone, postal_code
      FROM warehouses
      ORDER BY
        CASE WHEN country = 'CN' THEN 0 ELSE 1 END,
        id ASC
      LIMIT 1
      `,
    ),
  ])

  const user = userRes.rows[0]
  const counts = countsRes.rows[0] as PortalDashboardCounts
  const warehouseRow = warehouseRes.rows[0]
  const memberCode = user?.code ?? ""

  return {
    firstName: user?.first_name?.trim() || "",
    lastName: user?.last_name?.trim() || "",
    memberCode,
    counts: {
      waiting_to_be_stored: Number(counts?.waiting_to_be_stored ?? 0),
      total_packages: Number(counts?.total_packages ?? 0),
      request_mail: Number(counts?.request_mail ?? 0),
      shipment: Number(counts?.shipment ?? 0),
      pending_payments: Number(counts?.pending_payments ?? 0),
    },
    announcements: announcementsRes.rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      message: row.message,
    })),
    warehouse: warehouseRow
      ? {
          id: warehouseRow.id,
          name: warehouseRow.name,
          copyText: formatWarehouseCopyText(warehouseRow, memberCode),
        }
      : null,
  }
}
