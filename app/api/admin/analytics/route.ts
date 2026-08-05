import { dbQuery } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden", success: false }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const daysParam = searchParams.get("days") || "30"
    const days = parseInt(daysParam, 10) || 30

    // Fetch user counts
    const usersCountRes = await dbQuery<{ count: number }>(`
      SELECT COUNT(*)::int as count FROM users;
    `)
    const totalUsers = usersCountRes.rows[0]?.count || 0

    // Fetch processed metrics total
    const totalMetricsRes = await dbQuery<{ total_cbm: number; total_kg: number }>(`
      SELECT 
        COALESCE(SUM(total_weight) FILTER (WHERE total_weight_unit = 'cbm'), 0)::numeric as total_cbm,
        COALESCE(SUM(total_weight) FILTER (WHERE total_weight_unit = 'kg'), 0)::numeric as total_kg
      FROM shipments
      WHERE created_at >= NOW() - INTERVAL '${days} days';
    `)
    const totalCbm = totalMetricsRes.rows[0]?.total_cbm || 0
    const totalKg = totalMetricsRes.rows[0]?.total_kg || 0

    // Fetch time-series details grouped by date intervals
    // If days >= 180 group by month, else group by date/week
    const interval = days >= 180 ? "month" : "day"
    const timeseriesRes = await dbQuery<{
      period: string
      shipments_count: number
      cbm_sum: number
      kg_sum: number
    }>(`
      SELECT 
        TO_CHAR(created_at, ${interval === "month" ? "'YYYY-MM'" : "'MM-DD'"}) as period,
        COUNT(*)::int as shipments_count,
        COALESCE(SUM(total_weight) FILTER (WHERE total_weight_unit = 'cbm'), 0)::numeric as cbm_sum,
        COALESCE(SUM(total_weight) FILTER (WHERE total_weight_unit = 'kg'), 0)::numeric as kg_sum
      FROM shipments
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY period
      ORDER BY period ASC;
    `)

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalCbm,
        totalKg,
        timeseries: timeseriesRes.rows,
      },
    })
  } catch (err) {
    console.error("Internal Server Error in analytics route", err)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
