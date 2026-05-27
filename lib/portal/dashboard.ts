import { pool } from "@/lib/db/db"

export type PortalDashboardCounts = {
  waiting_to_be_stored: number
  total_packages: number
  request_mail: number
  shipment: number
  pending_payments: number
  pending_payments_total: number
  delivered_shipments: number
  total_shipments: number
}

export type PortalDashboardShipment = {
  trackingNumber: string
  status: string
  channel: string
  totalCost: number
  totalWeight: number
  paymentTime: string
  createdAt: string
  originLabel: string
  destinationLabel: string
}

export type PortalDashboardActivityRow = {
  id: string
  kind: "shipment" | "package" | "incoming"
  title: string
  status: string
  channel: string | null
  routeLabel: string
  weight: number | null
  fee: number | null
  createdAt: string
}

export type PortalDashboardData = {
  firstName: string
  lastName: string
  memberCode: string
  counts: PortalDashboardCounts
  activeShipments: PortalDashboardShipment[]
  recentActivity: PortalDashboardActivityRow[]
}

function warehouseLabel(
  city: string | null,
  country: string | null,
): string {
  const parts = [city, country].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "Warehouse"
}

export async function getPortalDashboardData(
  userId: number,
): Promise<PortalDashboardData> {
  const [userRes, countsRes, shipmentsRes, activityRes] = await Promise.all([
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
          WHERE status = 'pending' AND user_id = $1) AS pending_payments,
        (SELECT COALESCE(SUM(amount), 0)::float FROM payments
          WHERE status = 'pending' AND user_id = $1) AS pending_payments_total,
        (SELECT COUNT(*)::int FROM shipments
          WHERE status = 'delivered' AND user_id = $1) AS delivered_shipments,
        (SELECT COUNT(*)::int FROM shipments
          WHERE user_id = $1) AS total_shipments
      `,
      [userId],
    ),
    pool.query(
      `
      SELECT
        s.tracking_number,
        s.status,
        s.channel,
        s.total_cost,
        s.total_weight,
        s.payment_time,
        s.created_at,
        ow.city AS origin_city,
        ow.country AS origin_country,
        dw.city AS dest_city,
        dw.country AS dest_country
      FROM shipments s
      LEFT JOIN warehouses ow ON ow.id = s.origin_warehouse_id
      LEFT JOIN warehouses dw ON dw.id = s.destination_warehouse_id
      WHERE s.user_id = $1 AND s.status != 'delivered'
      ORDER BY s.created_at DESC
      LIMIT 8
      `,
      [userId],
    ),
    pool.query(
      `
      (
        SELECT
          s.tracking_number AS id,
          'shipment' AS kind,
          s.tracking_number AS title,
          s.status::text AS status,
          s.channel,
          s.total_weight,
          s.total_cost,
          s.created_at,
          ow.city AS origin_city,
          ow.country AS origin_country,
          dw.city AS dest_city,
          dw.country AS dest_country
        FROM shipments s
        LEFT JOIN warehouses ow ON ow.id = s.origin_warehouse_id
        LEFT JOIN warehouses dw ON dw.id = s.destination_warehouse_id
        WHERE s.user_id = $1
      )
      UNION ALL
      (
        SELECT
          p.incoming_package_id AS id,
          'package' AS kind,
          p.package_name AS title,
          p.status::text AS status,
          NULL AS channel,
          p.weight AS total_weight,
          NULL::numeric AS total_cost,
          p.created_at,
          NULL, NULL, NULL, NULL
        FROM packages p
        WHERE p.user_id = $1
      )
      UNION ALL
      (
        SELECT
          ip.incoming_tracking_number AS id,
          'incoming' AS kind,
          ip.declared_item_name AS title,
          ip.status::text AS status,
          NULL AS channel,
          ip.declared_item_weight AS total_weight,
          NULL::numeric AS total_cost,
          ip.created_at,
          NULL, NULL, NULL, NULL
        FROM incoming_packages ip
        WHERE ip.user_id = $1
      )
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [userId],
    ),
  ])

  const user = userRes.rows[0]
  const counts = countsRes.rows[0] as PortalDashboardCounts

  const activeShipments: PortalDashboardShipment[] = shipmentsRes.rows.map(
    (row) => ({
      trackingNumber: row.tracking_number,
      status: row.status,
      channel: row.channel ?? "",
      totalCost: Number(row.total_cost ?? 0),
      totalWeight: Number(row.total_weight ?? 0),
      paymentTime: row.payment_time ?? "",
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString(),
      originLabel: warehouseLabel(row.origin_city, row.origin_country),
      destinationLabel: warehouseLabel(row.dest_city, row.dest_country),
    }),
  )

  const recentActivity: PortalDashboardActivityRow[] = activityRes.rows.map(
    (row) => {
      const origin = warehouseLabel(row.origin_city, row.origin_country)
      const dest = warehouseLabel(row.dest_city, row.dest_country)
      const routeLabel =
        row.kind === "shipment" && row.origin_city
          ? `${origin} → ${dest}`
          : row.kind === "incoming"
            ? "On the way to warehouse"
            : "At warehouse"

      return {
        id: String(row.id),
        kind: row.kind as PortalDashboardActivityRow["kind"],
        title: row.title ?? row.id,
        status: row.status,
        channel: row.channel ?? null,
        routeLabel,
        weight: row.total_weight != null ? Number(row.total_weight) : null,
        fee: row.total_cost != null ? Number(row.total_cost) : null,
        createdAt: row.created_at
          ? new Date(row.created_at).toISOString()
          : new Date().toISOString(),
      }
    },
  )

  return {
    firstName: user?.first_name?.trim() || "",
    lastName: user?.last_name?.trim() || "",
    memberCode: user?.code ?? "",
    counts: {
      waiting_to_be_stored: Number(counts?.waiting_to_be_stored ?? 0),
      total_packages: Number(counts?.total_packages ?? 0),
      request_mail: Number(counts?.request_mail ?? 0),
      shipment: Number(counts?.shipment ?? 0),
      pending_payments: Number(counts?.pending_payments ?? 0),
      pending_payments_total: Number(counts?.pending_payments_total ?? 0),
      delivered_shipments: Number(counts?.delivered_shipments ?? 0),
      total_shipments: Number(counts?.total_shipments ?? 0),
    },
    activeShipments,
    recentActivity,
  }
}
