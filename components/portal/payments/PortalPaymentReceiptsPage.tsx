"use client"

import { PortalPageBack } from "@/components/portal/PortalPageBack"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentStatusLabel,
} from "@/lib/portal/paymentDisplay"
import type { Payment } from "@/types/entityTypeDef"
import type { PaymentStatus } from "@/types/statusTypes"
import { IconReceipt } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/ui/toast"

export function PortalPaymentReceiptsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [trackingQuery, setTrackingQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("")

  useEffect(() => {
    let cancelled = false

    fetch("/api/payments/user", { credentials: "include" })
      .then((r) => r.json())
      .then((result) => {
        if (cancelled) return
        if (!result.success) {
          toast.error(result.message ?? "Could not load payment receipts")
          return
        }
        setPayments(result.data ?? [])
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load payment receipts")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = trackingQuery.trim().toLowerCase()
    return payments.filter((payment) => {
      const matchesTracking =
        !q ||
        payment.shipment_tracking_number.toLowerCase().includes(q) ||
        payment.transaction_ref.toLowerCase().includes(q)
      const matchesStatus =
        !statusFilter || payment.status === statusFilter
      return matchesTracking && matchesStatus
    })
  }, [payments, trackingQuery, statusFilter])

  return (
    <div className="portal-account portal-payments">
      <header className="portal-account__header">
        <PortalPageBack href="/customer" label="Home" />
        <h1 className="portal-account__title">Payment receipts</h1>
        <p className="portal-account__subtitle">
          Shipment payments you have made or started - filter by tracking number
          or status.
        </p>
      </header>

      <div className="portal-payments__filters portal-home__panel">
        <div className="portal-payments__filter-row">
          <label className="portal-packages__field-label" htmlFor="payment-search">
            Search
          </label>
          <input
            id="payment-search"
            type="search"
            className="portal-payments__input"
            placeholder="Tracking number or reference…"
            value={trackingQuery}
            onChange={(e) => setTrackingQuery(e.target.value)}
          />
        </div>
        <div className="portal-payments__filter-row">
          <label className="portal-packages__field-label" htmlFor="payment-status">
            Status
          </label>
          <select
            id="payment-status"
            className="portal-payments__select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as PaymentStatus | "")
            }
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="awaiting_confirmation">Awaiting confirmation</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <p className="portal-payments__count">
        {loading ? "Loading…" : `${filtered.length} receipt${filtered.length === 1 ? "" : "s"}`}
      </p>

      {loading ? (
        <div className="portal-packages__loading flex justify-center py-16">
          <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="portal-packages__empty portal-payments__empty">
          <IconReceipt
            size={32}
            stroke={1.25}
            className="portal-payments__empty-icon"
            aria-hidden
          />
          <p>No payment receipts found.</p>
          <p className="portal-payments__empty-hint">
            {payments.length === 0
              ? "Payments for your shipments will show up here."
              : "Try a different search or status filter."}
          </p>
        </div>
      ) : (
        <ul className="portal-payments__list">
          {filtered.map((payment) => (
            <li key={payment.id}>
              <article className="portal-payments__card">
                <div className="portal-payments__card-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.75rem", width: "100%" }}>
                  <div className="flex w-full justify-between items-center" style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="text-xs font-semibold text-dheir-muted">
                      Pay in Nigeria DHEIR receipt NO.: <span className="font-mono text-dheir-blue select-all" style={{ color: "var(--color-dheir-blue)" }}>{payment.shipment_tracking_number}</span>
                    </span>
                    <span
                      className={`portal-payments__status portal-payments__status--${payment.status}`}
                    >
                      {paymentStatusLabel(payment.status)}
                    </span>
                  </div>
                </div>

                <p className="portal-payments__ref portal-payments__ref--sub" style={{ marginTop: "0.5rem" }}>
                  Ref {payment.transaction_ref}
                </p>

                <div className="portal-packages__card-details mt-4 pt-4 border-t border-[var(--color-dheir-border)]">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", fontSize: "0.875rem" }}>
                    {/* Left Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div>
                        <span className="text-dheir-muted">tracking: </span>
                        <span className="font-semibold text-dheir-ink capitalize">{(payment as any).shipment_channel || "skyjet"}</span>
                      </div>
                      <div>
                        <span className="text-dheir-muted">Weight: </span>
                        <span className="font-semibold text-dheir-ink">
                          {(payment as any).shipment_weight_unit === "cbm" ? "0.00" : Number((payment as any).shipment_weight || 0).toFixed(2)}KG
                        </span>
                      </div>
                      <div>
                        <span className="text-dheir-muted">Unit price: </span>
                        <span className="font-semibold text-dheir-ink">
                          {(payment as any).shipment_weight_unit === "cbm" 
                            ? "₦0.00" 
                            : (payment as any).shipment_weight && Number((payment as any).shipment_weight) > 0
                              ? formatPaymentAmount(Number(payment.amount) / Number((payment as any).shipment_weight))
                              : "₦0.00"
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-dheir-muted">Additional: </span>
                        <span className="font-semibold text-dheir-ink">₦0.00</span>
                      </div>
                      <div>
                        <span className="text-dheir-muted">Time: </span>
                        <span className="font-semibold text-dheir-ink">{new Date(payment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div>
                        <span className="text-dheir-muted">Total: </span>
                        <span className="font-semibold text-dheir-ink">{((payment as any).shipment_package_ids ?? []).length || 1}</span>
                      </div>
                      {(payment as any).shipment_weight_unit === "cbm" ? (
                        <>
                          <div>
                            <span className="text-dheir-muted">Cube: </span>
                            <span className="font-semibold text-dheir-ink">{Number((payment as any).shipment_weight || 0).toFixed(3)}m3</span>
                          </div>
                          <div>
                            <span className="text-dheir-muted">Unit price: </span>
                            <span className="font-semibold text-dheir-ink">
                              {(payment as any).shipment_weight && Number((payment as any).shipment_weight) > 0
                                ? formatPaymentAmount(Number(payment.amount) / Number((payment as any).shipment_weight))
                                : "₦0.00"
                              }
                            </span>
                          </div>
                        </>
                      ) : (
                        <div>
                          <span className="text-dheir-muted">Fuel: </span>
                          <span className="font-semibold text-dheir-ink">0.00%</span>
                        </div>
                      )}
                      <div>
                        <span className="text-dheir-muted">Total: </span>
                        <span className="font-semibold text-dheir-ink text-dheir-blue" style={{ fontSize: "1rem" }}>
                          {formatPaymentAmount(payment.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-dheir-muted">outbound: </span>
                        <span className="font-semibold text-dheir-ink">{new Date(payment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {((payment as any).air_gz_cost || (payment as any).air_hk_cost || (payment as any).air_gz_weight || (payment as any).air_hk_weight) && (
                    <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem", padding: "8px 10px", borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="font-semibold text-dheir-ink" style={{ fontSize: "0.75rem" }}>Flight Channel Breakdown:</span>
                      {(payment as any).air_gz_weight != null && Number((payment as any).air_gz_weight) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                          <span style={{ color: "var(--color-dheir-blue)", fontWeight: 500 }}>✈️ Air GZ (Normal):</span>
                          <span>{Number((payment as any).air_gz_weight).toFixed(2)} {((payment as any).air_gz_weight_unit ?? "kg").toUpperCase()} {(payment as any).air_gz_cost ? `· ₦${Number((payment as any).air_gz_cost).toLocaleString("en-NG")}` : ""} {(payment as any).air_gz_expected_arrival_date ? `· EDD: ${(payment as any).air_gz_expected_arrival_date.split("T")[0]}` : ""}</span>
                        </div>
                      )}
                      {(payment as any).air_hk_weight != null && Number((payment as any).air_hk_weight) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                          <span style={{ color: "var(--color-dheir-orange)", fontWeight: 500 }}>✈️ Air HK (Sensitive):</span>
                          <span>{Number((payment as any).air_hk_weight).toFixed(2)} {((payment as any).air_hk_weight_unit ?? "kg").toUpperCase()} {(payment as any).air_hk_cost ? `· ₦${Number((payment as any).air_hk_cost).toLocaleString("en-NG")}` : ""} {(payment as any).air_hk_expected_arrival_date ? `· EDD: ${(payment as any).air_hk_expected_arrival_date.split("T")[0]}` : ""}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--color-dheir-border)", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8rem" }}>
                    {(payment as any).origin_warehouse_name && (
                      <div>
                        <span className="font-semibold text-dheir-ink">Route: </span>
                        <span className="text-dheir-muted">{(payment as any).origin_warehouse_name} → {(payment as any).destination_warehouse_name}</span>
                      </div>
                    )}
                    {payment.channel && (
                      <div>
                        <span className="font-semibold text-dheir-ink">Method: </span>
                        <span className="text-dheir-muted">{payment.channel}</span>
                      </div>
                    )}
                    {(payment as any).shipment_note && (
                      <div>
                        <span className="font-semibold text-dheir-ink">Customer Note: </span>
                        <span className="text-dheir-muted">{(payment as any).shipment_note}</span>
                      </div>
                    )}
                    {(payment as any).admin_reply && (
                      <div style={{ marginTop: 4, padding: "4px 8px", borderRadius: 4, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <span className="font-semibold text-emerald-800">Admin Reply: </span>
                        <span className="text-emerald-900">{(payment as any).admin_reply}</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
