import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden", success: false }, { status: 403 })
    }

    const [shipmentsRes, packagesRes] = await Promise.all([
      dbQuery<{
        total_active: number
        processing: number
        shipped: number
        in_transit: number
        delivered: number
        air_gz_count: number
        air_gz_kg: number
        air_hk_count: number
        air_hk_kg: number
        sea_count: number
        sea_cbm: number
      }>(`
        SELECT
          COUNT(*) FILTER (WHERE status != 'delivered')::int AS total_active,
          COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
          COUNT(*) FILTER (WHERE status = 'shipped')::int    AS shipped,
          COUNT(*) FILTER (WHERE status = 'in_transit')::int AS in_transit,
          COUNT(*) FILTER (WHERE status = 'delivered')::int  AS delivered,
          COUNT(*) FILTER (WHERE channel ILIKE '%gz%' OR channel = 'air')::int AS air_gz_count,
          COALESCE(SUM(total_weight) FILTER (WHERE (channel ILIKE '%gz%' OR channel = 'air') AND total_weight_unit = 'kg'), 0)::numeric AS air_gz_kg,
          COUNT(*) FILTER (WHERE channel ILIKE '%hk%')::int AS air_hk_count,
          COALESCE(SUM(total_weight) FILTER (WHERE channel ILIKE '%hk%' AND total_weight_unit = 'kg'), 0)::numeric AS air_hk_kg,
          COUNT(*) FILTER (WHERE channel = 'sea')::int AS sea_count,
          COALESCE(SUM(total_weight) FILTER (WHERE channel = 'sea' AND total_weight_unit = 'cbm'), 0)::numeric AS sea_cbm
        FROM shipments;
      `),
      dbQuery<{
        total_packages: number
        total_qty: number
        total_package_weight: number
      }>(`
        SELECT
          COUNT(*)::int AS total_packages,
          COALESCE(SUM(amount), 0)::int AS total_qty,
          COALESCE(SUM(weight), 0)::numeric AS total_package_weight
        FROM packages;
      `),
    ])

    const sRow = shipmentsRes.rows[0]
    const pRow = packagesRes.rows[0]

    return NextResponse.json({
      success: true,
      message: "Active Shipment and Parcel Count successfully retrieved",
      data: {
        total_active_count: sRow.total_active,
        processing: sRow.processing,
        shipped: sRow.shipped,
        in_transit: sRow.in_transit,
        delivered: sRow.delivered,
        air_gz_count: sRow.air_gz_count,
        air_gz_kg: Number(sRow.air_gz_kg),
        air_hk_count: sRow.air_hk_count,
        air_hk_kg: Number(sRow.air_hk_kg),
        sea_count: sRow.sea_count,
        sea_cbm: Number(sRow.sea_cbm),
        total_packages: pRow.total_packages,
        total_parcel_qty: pRow.total_qty,
        total_package_weight: Number(pRow.total_package_weight),
      },
    })
  } catch (err) {
    console.error("Internal Server Error", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
