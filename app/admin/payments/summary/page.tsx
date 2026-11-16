"use client"

import { useEffect, useState, useMemo } from "react"
import { Table } from "@/components/admin/table/Table"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { formatPaymentAmount, formatPaymentDate } from "@/lib/portal/paymentDisplay"
import { createColumnHelper } from "@tanstack/react-table"
import {
  IconCash,
  IconAlertTriangle,
  IconProgressAlert,
  IconCreditCard,
} from "@tabler/icons-react"
import { toast } from "@/lib/ui/toast"

type PaymentMethodKind = "paystack" | "bank_transfer" | "manual" | "unpaid"

type PaymentRecord = {
  id: string
  reference: string
  payment_ref: string | null
  customer_code: string
  channel: string
  payment_method: PaymentMethodKind
  amount: number
  status: string
  paid: boolean
  paid_at: string | null
  type: string
  overdue: boolean
  created_at: string
}

type Metrics = {
  totalOutstanding: number
  totalOverdue: number
  totalCollected: number
  totalPaystackCollected: number
  totalBankTransferCollected: number
  totalManualCollected: number
  paystackCount: number
  bankTransferCount: number
  manualCount: number
  paidCount: number
}

const columnHelper = createColumnHelper<PaymentRecord>()

function formatMethodLabel(method: PaymentMethodKind) {
  if (method === "paystack") return "Paystack"
  if (method === "bank_transfer") return "Bank Transfer"
  if (method === "manual") return "Admin Marked"
  return "Unpaid"
}

export default function PaymentSummaryPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "overdue">("all")
  const [methodFilter, setMethodFilter] = useState<"all" | "paystack" | "bank_transfer" | "manual">("all")

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
    const q = search.trim().toLowerCase()
    return records.filter((r) => {
      if (q) {
        const methodText = formatMethodLabel(r.payment_method).toLowerCase()
        const matchesSearch =
          r.customer_code?.toLowerCase().includes(q) ||
          r.reference?.toLowerCase().includes(q) ||
          r.payment_ref?.toLowerCase().includes(q) ||
          methodText.includes(q)
        if (!matchesSearch) return false
      }

      if (statusFilter === "paid" && !r.paid) return false
      if (statusFilter === "unpaid" && r.paid) return false
      if (statusFilter === "overdue" && !r.overdue) return false

      if (methodFilter !== "all" && r.payment_method !== methodFilter) return false

      return true
    })
  }, [records, search, statusFilter, methodFilter])

  const columns = [
    columnHelper.accessor("reference", {
      header: "Reference",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{item.reference}</div>
            {item.payment_ref && item.payment_ref !== item.reference ? (
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                Ref: {item.payment_ref}
              </div>
            ) : item.type !== "Shipment" ? (
              <div style={{ fontSize: "11px", color: "#6b7280" }}>{item.type}</div>
            ) : null}
          </div>
        )
      },
    }),
    columnHelper.accessor("customer_code", {
      header: "Customer Code",
    }),
    columnHelper.accessor("channel", {
      header: "Shipping",
      cell: ({ getValue }) => <span>{getValue()?.toUpperCase()}</span>,
    }),
    columnHelper.accessor("payment_method", {
      header: "Payment Method",
      cell: ({ getValue }) => {
        const method = getValue()
        if (method === "paystack") {
          return (
            <span className="portal-packages__badge portal-packages__badge--blue">
              Paystack
            </span>
          )
        }
        if (method === "bank_transfer") {
          return (
            <span className="portal-packages__badge portal-packages__badge--green">
              Bank Transfer
            </span>
          )
        }
        if (method === "manual") {
          return (
            <span className="portal-packages__badge portal-packages__badge--neutral">
              Admin Marked
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
      header: "Fulfillment Status",
      cell: ({ getValue }) => (
        <span style={{ fontSize: "13px", textTransform: "capitalize" }}>
          {getValue()?.replaceAll("_", " ")}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Date",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div>
            <div>{formatPaymentDate(item.paid_at || item.created_at)}</div>
            {item.paid_at ? (
              <div style={{ fontSize: "11px", color: "#6b7280" }}>Paid</div>
            ) : null}
          </div>
        )
      },
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
            Monitor Paystack payments, bank transfers, collected revenue, and customer overdues.
          </p>
        </div>
      </header>

      {/* Financial Metrics Cards */}
      <div className="portal-home__stats" role="list" aria-label="Financial Summary Stats">
        <button
          type="button"
          className="portal-home__stat-card"
          role="listitem"
          onClick={() => {
            setStatusFilter("overdue")
            setMethodFilter("all")
          }}
          style={{
            textAlign: "left",
            borderColor: statusFilter === "overdue" ? "#ef4444" : undefined,
          }}
        >
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
        </button>

        <button
          type="button"
          className="portal-home__stat-card"
          role="listitem"
          onClick={() => {
            setStatusFilter("unpaid")
            setMethodFilter("all")
          }}
          style={{
            textAlign: "left",
            borderColor: statusFilter === "unpaid" ? "#f59e0b" : undefined,
          }}
        >
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
        </button>

        <button
          type="button"
          className="portal-home__stat-card"
          role="listitem"
          onClick={() => {
            setStatusFilter("paid")
            setMethodFilter("all")
          }}
          style={{
            textAlign: "left",
            borderColor: statusFilter === "paid" && methodFilter === "all" ? "#10b981" : undefined,
          }}
        >
          <span className="portal-home__stat-card-icon" aria-hidden style={{ color: "#10b981", backgroundColor: "#f0fdf4" }}>
            <IconCash size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Total Collected</span>
            <span className="portal-home__stat-card-value" style={{ color: "#10b981" }}>
              {formatPaymentAmount(metrics?.totalCollected || 0)}
            </span>
            <span className="portal-home__stat-card-hint">
              {metrics?.bankTransferCount || 0} transfer · {metrics?.paystackCount || 0} Paystack
            </span>
          </span>
        </button>

        <button
          type="button"
          className="portal-home__stat-card"
          role="listitem"
          onClick={() => {
            setStatusFilter("all")
            setMethodFilter("paystack")
          }}
          style={{
            textAlign: "left",
            borderColor: methodFilter === "paystack" ? "var(--color-dheir-blue)" : undefined,
          }}
        >
          <span className="portal-home__stat-card-icon" aria-hidden style={{ color: "#1a5fff", backgroundColor: "#eef4ff" }}>
            <IconCreditCard size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Paystack Collected</span>
            <span className="portal-home__stat-card-value" style={{ color: "#1a5fff" }}>
              {formatPaymentAmount(metrics?.totalPaystackCollected || 0)}
            </span>
            <span className="portal-home__stat-card-hint">
              {metrics?.paystackCount || 0} verified{" "}
              {(metrics?.paystackCount || 0) === 1 ? "payment" : "payments"}
            </span>
          </span>
        </button>
      </div>

      {/* Filters ledger */}
      <section className="portal-home__panel" aria-label="Filters" style={{ marginTop: "24px" }}>
        <div className="portal-home__panel-head">
          <h2 className="portal-home__section-title">Filters</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            className="dheir-input"
            style={{ maxWidth: "320px", width: "100%", height: "42px" }}
            placeholder="Search customer, ref, or Paystack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", background: "#f5f5f7", padding: "4px", borderRadius: "8px" }}>
            {[
              { label: "All Records", value: "all" },
              { label: "Paid", value: "paid" },
              { label: "Unpaid", value: "unpaid" },
              { label: "Overdue", value: "overdue" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value as typeof statusFilter)}
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
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", background: "#f5f5f7", padding: "4px", borderRadius: "8px" }}>
            {[
              { label: "All Methods", value: "all" },
              { label: `Paystack (${metrics?.paystackCount || 0})`, value: "paystack" },
              { label: `Bank Transfer (${metrics?.bankTransferCount || 0})`, value: "bank_transfer" },
              { label: `Admin Marked (${metrics?.manualCount || 0})`, value: "manual" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setMethodFilter(tab.value as typeof methodFilter)}
                style={{
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: methodFilter === tab.value ? "#ffffff" : "transparent",
                  color: methodFilter === tab.value ? "var(--color-dheir-blue)" : "#666",
                  boxShadow: methodFilter === tab.value ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
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
            <p className="portal-home__section-sub">
              Tracks shipment and order charges alongside payment gateway (Paystack vs Bank Transfer).
            </p>
          </div>
        </div>
        {methodFilter === "paystack" && filteredData.length === 0 ? (
          <div
            style={{
              padding: "28px 20px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              textAlign: "center",
              color: "#475569",
              fontSize: "14px",
            }}
          >
            <strong>No completed Paystack payments recorded yet.</strong>
            <div style={{ marginTop: "6px", fontSize: "13px", color: "#64748b" }}>
              Completed customer checkouts via Paystack are tagged automatically as{" "}
              <strong>Paystack</strong> and appear here right after verification.
            </div>
          </div>
        ) : (
          <Table
            key={`${statusFilter}-${methodFilter}`}
            importedData={filteredData}
            columnDef={columns}
            globalFilter=""
            pageSize={20}
          />
        )}
      </section>
    </div>
  )
}
