"use client"

import { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { IconUsers, IconScale, IconBox } from "@tabler/icons-react"
import { toast } from "@/lib/ui/toast"

type AnalyticsData = {
  totalUsers: number
  totalCbm: number
  totalKg: number
  timeseries: {
    period: string
    shipments_count: number
    cbm_sum: number
    kg_sum: number
  }[]
}

export function DashboardAnalytics() {
  const [days, setDays] = useState<number>(30)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`)
        const result = await res.json()
        if (res.ok && result.success) {
          setData(result.data)
        } else {
          toast.error(result.message || "Failed to load analytics data")
        }
      } catch (err) {
        console.error("Error fetching analytics", err)
        toast.error("Error loading dashboard metrics")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [days])

  if (loading && !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
        <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
      </div>
    )
  }

  const chartData = data?.timeseries.map((t) => ({
    name: t.period,
    Shipments: Number(t.shipments_count),
    CBM: parseFloat(Number(t.cbm_sum).toFixed(2)),
    KG: parseFloat(Number(t.kg_sum).toFixed(1)),
  })) || []

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "24px" }}>
      {/* Time filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h2 className="portal-home__section-title" style={{ margin: 0 }}>Business Analytics</h2>
        <div style={{ display: "flex", gap: "8px", background: "#f5f5f7", padding: "4px", borderRadius: "8px" }}>
          {[
            { label: "7 Days", value: 7 },
            { label: "30 Days", value: 30 },
            { label: "90 Days", value: 90 },
            { label: "1 Year", value: 365 },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setDays(item.value)}
              style={{
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: days === item.value ? "#ffffff" : "transparent",
                color: days === item.value ? "var(--color-dheir-blue)" : "#666",
                boxShadow: days === item.value ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                transition: "all 150ms ease",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Cards */}
      <div className="portal-home__stats" role="list" aria-label="Business Metrics" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="portal-home__stat-card" role="listitem" style={{ cursor: "default" }}>
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconUsers size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Total Registered Users</span>
            <span className="portal-home__stat-card-value">{data?.totalUsers || 0}</span>
            <span className="portal-home__stat-card-hint">All time</span>
          </span>
        </div>

        <div className="portal-home__stat-card" role="listitem" style={{ cursor: "default" }}>
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconBox size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Processed Volume</span>
            <span className="portal-home__stat-card-value">
              {parseFloat(Number(data?.totalCbm || 0).toFixed(2))} CBM
            </span>
            <span className="portal-home__stat-card-hint">Selected period</span>
          </span>
        </div>

        <div className="portal-home__stat-card" role="listitem" style={{ cursor: "default" }}>
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconScale size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Processed Weight</span>
            <span className="portal-home__stat-card-value">
              {parseFloat(Number(data?.totalKg || 0).toFixed(1))} KG
            </span>
            <span className="portal-home__stat-card-hint">Selected period</span>
          </span>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="portal-home__panel" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "var(--color-dheir-ink, #111)" }}>
            Processed volume & shipments timeseries
          </h3>
          <p className="admin-uploader__help" style={{ margin: "4px 0 0 0" }}>
            Timeseries representation of shipment counts, CBM values, and weight records.
          </p>
        </div>

        {chartData.length === 0 ? (
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
            No data available for this range
          </div>
        ) : (
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-dheir-blue, #0056cc)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-dheir-blue, #0056cc)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "none",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="Shipments"
                  stroke="var(--color-dheir-blue, #0056cc)"
                  fillOpacity={1}
                  fill="url(#colorShipments)"
                  strokeWidth={2}
                />
                <Bar dataKey="CBM" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="KG" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
