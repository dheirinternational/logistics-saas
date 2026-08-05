"use client"

import { useEffect, useState, useMemo } from "react"
import { Table } from "@/components/admin/table/Table"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { formatPaymentAmount, formatPaymentDate } from "@/lib/portal/paymentDisplay"
import { createColumnHelper } from "@tanstack/react-table"
import { IconCash, IconAlertTriangle, IconProgressAlert } from "@tabler/icons-react"
import { toast } from "@/lib/ui/toast"

type PaymentRecord = {
  id: string
  reference: string
  customer_code: string
  channel: string
  amount: number
  status: string
  paid: boolean
  type: string
  overdue: boolean
  created_at: string
}

type Metrics = {
  totalOutstanding: number
  totalOverdue: number
  totalCollected: number
}

const columnHelper = createColumnHelper<PaymentRecord>()

export default function PaymentSummaryPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "overdue">("all")

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/payments/summary")
      const result = await res.json()
      if (res.ok && result.success) {
        setRecords(result.data.records || [])
        setMetrics(result.data.metrics)
      } else {
        toast.error(result.message || "Failed to load payment ledger")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error loading payment summary")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const filteredData = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.customer_code?.toLowerCase().includes(search.toLowerCase()) ||
        r.reference?.toLowerCase().includes(search.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter === "paid") return r.paid
      if (statusFilter === "unpaid") return !r.paid
      if (statusFilter === "overdue") return r.overdue

      return true
    })
  }, [records, search, statusFilter])

  const columns = [
    columnHelper.accessor("reference", {
      header: "Reference",
    }),
    columnHelper.accessor("customer_code", {
      header: "Customer Code",
    }),
    columnHelper.accessor("channel", {
      header: "Channel",
      cell: ({ getValue }) => <span>{getValue()?.toUpperCase()}</span>,
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: ({ getValue }) => (
        <span className="tabular-nums" style={{ fontWeight: 600 }}>
          {formatPaymentAmount(Number(getValue()))}
        </span>
      ),
    }),
    columnHelper.accessor("paid", {
      header: "Payment Status",
      cell: ({ row }) => {
        const item = row.original
        if (item.paid) {
          return (
            <span className="portal-packages__badge portal-packages__badge--green">
              Paid
            </span>
          )
        }
        if (item.overdue) {
          return (
            <span className="portal-packages__badge" style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}>
              Overdue
            </span>
          )
        }
        return (
          <span className="portal-packages__badge portal-packages__badge--muted">
            Unpaid
          </span>
        )
      },
    }),
    columnHelper.accessor("status", {
      header: "Shipping Status",
      cell: ({ getValue }) => (
        <span style={{ fontSize: "13px", textTransform: "capitalize" }}>
          {getValue()?.replaceAll("_", " ")}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Date Created",
      cell: ({ getValue }) => <span>{formatPaymentDate(getValue())}</span>,
    }),
  ]

  if (loading && !metrics) {
    return (
      <div className="portal-home" style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
        <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
      </div>
    )
  }

  return (
    <div className="portal-home">
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Finance</p>
          <h1 className="portal-home__greeting-title">Payment Summary</h1>
          <p className="portal-home__greeting-sub">
            Monitor receivables, collected payments, and track customer overdues.
          </p>
        </div>
      </header>

      {/* Financial Metrics Cards */}
      <div className="portal-home__stats" role="list" aria-label="Financial Summary Stats">
        <div className="portal-home__stat-card" role="listitem" style={{ cursor: "default" }}>
          <span className="portal-home__stat-card-icon" aria-hidden style={{ color: "#ef4444", backgroundColor: "#fef2f2" }}>
            <IconAlertTriangle size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Overdue Receivable</span>
            <span className="portal-home__stat-card-value" style={{ color: "#ef4444" }}>
              {formatPaymentAmount(metrics?.totalOverdue || 0)}
            </span>
            <span className="portal-home__stat-card-hint">Unpaid shipped packages</span>
          </span>
        </div>

        <div className="portal-home__stat-card" role="listitem" style={{ cursor: "default" }}>
          <span className="portal-home__stat-card-icon" aria-hidden style={{ color: "#f59e0b", backgroundColor: "#fffbeb" }}>
            <IconProgressAlert size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Outstanding Balance</span>
            <span className="portal-home__stat-card-value">
              {formatPaymentAmount(metrics?.totalOutstanding || 0)}
            </span>
            <span className="portal-home__stat-card-hint">Total unpaid items</span>
          </span>
        </div>

        <div className="portal-home__stat-card" role="listitem" style={{ cursor: "default" }}>
          <span className="portal-home__stat-card-icon" aria-hidden style={{ color: "#10b981", backgroundColor: "#f0fdf4" }}>
            <IconCash size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Total Collected</span>
            <span className="portal-home__stat-card-value" style={{ color: "#10b981" }}>
              {formatPaymentAmount(metrics?.totalCollected || 0)}
            </span>
            <span className="portal-home__stat-card-hint">Paid confirmations</span>
          </span>
        </div>
      </div>

      {/* Filters ledger */}
      <section className="portal-home__panel" aria-label="Filters" style={{ marginTop: "24px" }}>
        <div className="portal-home__panel-head">
          <h2 className="portal-home__section-title">Filters</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <input
            type="text"
            className="dheir-input"
            style={{ maxWidth: "320px", width: "100%", height: "42px" }}
            placeholder="Search by customer code or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: "flex", gap: "8px", background: "#f5f5f7", padding: "4px", borderRadius: "8px" }}>
            {[
              { label: "All Records", value: "all" },
              { label: "Paid", value: "paid" },
              { label: "Unpaid", value: "unpaid" },
              { label: "Overdue", value: "overdue" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value as any)}
                style={{
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: statusFilter === tab.value ? "#ffffff" : "transparent",
                  color: statusFilter === tab.value ? "var(--color-dheir-blue)" : "#666",
                  boxShadow: statusFilter === tab.value ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                  transition: "all 150ms ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ledger Table */}
      <section className="portal-home__panel" aria-labelledby="ledger-title" style={{ marginTop: "24px" }}>
        <div className="portal-home__panel-head">
          <div>
            <h2 id="ledger-title" className="portal-home__section-title">Payment Ledger</h2>
            <p className="portal-home__section-sub">A detailed overview of shipment charges and status.</p>
          </div>
        </div>
        <Table
          importedData={filteredData}
          columnDef={columns}
          globalFilter={search}
          pageSize={20}
        />
      </section>
    </div>
  )
}
