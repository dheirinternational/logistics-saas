import { pool } from "@/lib/db/db"

export type PortalTrackingFilter = "active" | "delivered" | "all"

export type PortalTrackingSummary = {
  active: number
  delivered: number
  total: number
}

export type PortalTrackingShipment = {
  trackingNumber: string
  status: string
  channel: string
  totalCost: number
  totalWeight: number
  totalWeightUnit?: string
  paymentTime: string
  paidFor: boolean
  shippingNote: string
  createdAt: string
  originLabel: string
  destinationLabel: string
  images?: { imageUrl: string; mediaType: string }[]
}

export type PortalTrackingData = {
  summary: PortalTrackingSummary
  shipments: PortalTrackingShipment[]
}

function warehouseLabel(
  city: string | null,
  country: string | null,
): string {
  const parts = [city, country].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "Warehouse"
}

function mapShipmentRow(
  row: {
    id: number
    tracking_number: string
    status: string
    channel: string | null
    total_cost: string | number | null
    total_weight: string | number | null
    total_weight_unit: string | null
    payment_time: string | null
    paid_for: boolean | null
    shipment_note: string | null
    created_at: Date | string | null
    origin_city: string | null
    origin_country: string | null
    dest_city: string | null
    dest_country: string | null
  },
  imagesMap: Record<number, { imageUrl: string; mediaType: string }[]>
): PortalTrackingShipment {
  return {
    trackingNumber: row.tracking_number,
    status: row.status,
    channel: row.channel ?? "",
    totalCost: Number(row.total_cost ?? 0),
    totalWeight: Number(row.total_weight ?? 0),
    totalWeightUnit: row.total_weight_unit ?? "kg",
    paymentTime: row.payment_time ?? "",
    paidFor: Boolean(row.paid_for),
    shippingNote: row.shipment_note?.trim() ?? "",
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
    originLabel: warehouseLabel(row.origin_city, row.origin_country),
    destinationLabel: warehouseLabel(row.dest_city, row.dest_country),
    images: imagesMap[Number(row.id)] ?? []
  }
}

export async function getPortalTrackingData(
  userId: number,
  filter: PortalTrackingFilter = "active",
): Promise<PortalTrackingData> {
  const statusClause =
    filter === "delivered"
      ? "AND s.status = 'delivered'"
      : filter === "active"
        ? "AND s.status != 'delivered'"
        : ""

  const [summaryRes, shipmentsRes] = await Promise.all([
    pool.query(
      `
      SELECT
        (SELECT COUNT(*)::int FROM shipments
          WHERE user_id = $1 AND status != 'delivered') AS active,
        (SELECT COUNT(*)::int FROM shipments
          WHERE user_id = $1 AND status = 'delivered') AS delivered,
        (SELECT COUNT(*)::int FROM shipments
          WHERE user_id = $1) AS total
      `,
      [userId],
    ),
    pool.query(
      `
      SELECT
        s.id,
        s.tracking_number,
        s.status,
        s.channel,
        s.total_cost,
        s.total_weight,
        s.total_weight_unit,
        s.payment_time,
        s.paid_for,
        s.shipment_note,
        s.created_at,
        ow.city AS origin_city,
        ow.country AS origin_country,
        dw.city AS dest_city,
        dw.country AS dest_country
      FROM shipments s
      LEFT JOIN warehouses ow ON ow.id = s.origin_warehouse_id
      LEFT JOIN warehouses dw ON dw.id = s.destination_warehouse_id
      WHERE s.user_id = $1
      ${statusClause}
      ORDER BY s.created_at DESC
      `,
      [userId],
    ),
  ])

  const summary = summaryRes.rows[0] ?? {}

  const shipmentIds = shipmentsRes.rows.map((row) => Number(row.id)).filter(Boolean)
  let imagesMap: Record<number, { imageUrl: string; mediaType: string }[]> = {}
  if (shipmentIds.length > 0) {
    const imagesRes = await pool.query(
      `SELECT shipment_id, image_url, media_type
       FROM shipment_images
       WHERE shipment_id = ANY($1)
       ORDER BY id ASC`,
      [shipmentIds]
    )
    for (const r of imagesRes.rows) {
      const sid = Number(r.shipment_id)
      if (!imagesMap[sid]) {
        imagesMap[sid] = []
      }
      imagesMap[sid].push({
        imageUrl: r.image_url,
        mediaType: r.media_type || "photo"
      })
    }
  }

  return {
    summary: {
      active: Number(summary.active ?? 0),
      delivered: Number(summary.delivered ?? 0),
      total: Number(summary.total ?? 0),
    },
    shipments: shipmentsRes.rows.map((r) => mapShipmentRow(r, imagesMap)),
  }
}
