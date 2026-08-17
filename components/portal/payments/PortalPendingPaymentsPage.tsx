"use client"

import MonnifyPaymentButton from "@/components/base/MonnifyPaymentBtn"
import { PortalPageBack } from "@/components/portal/PortalPageBack"
import { PortalPolicyInfoButton } from "@/components/portal/PortalPolicyInfoButton"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { LOGISTICS_SHIPPING_POLICY } from "@/lib/portal/customerPolicies"
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentStatusLabel,
} from "@/lib/portal/paymentDisplay"
import type { Payment, User } from "@/types/entityTypeDef"
import { IconBuildingBank, IconCreditCard } from "@tabler/icons-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/ui/toast"

const MONNIFY_ENABLED = process.env.NEXT_PUBLIC_MONNIFY_CHECKOUT_ENABLED !== "false"

export function PortalPendingPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [bankTransferEnabled, setBankTransferEnabled] = useState(false)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const [userRes, paymentsRes, bankRes] = await Promise.all([
        fetch("/api/users/my-data", { credentials: "include" }),
        fetch("/api/payments/user", { credentials: "include" }),
        fetch("/api/bank-transfer/config", { credentials: "include" }),
      ])

      const userData = await userRes.json()
      const paymentsData = await paymentsRes.json()

      if (!userRes.ok) {
        toast.error(userData.message ?? "Could not load your profile")
      } else {
        setUser(userData.data ?? null)
      }

      if (!paymentsRes.ok) {
        toast.error(paymentsData.message ?? "Could not load pending payments")
        setPayments([])
        return
      }

      setBankTransferEnabled(bankRes.ok)

      setPayments(
        (paymentsData.data ?? []).filter(
          (payment: Payment) =>
            payment.status === "pending" ||
            payment.status === "awaiting_confirmation",
        ),
      )
    } catch {
      toast.error("Could not load pending payments")
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return payments
    return payments.filter(
      (payment) =>
        payment.shipment_tracking_number.toLowerCase().includes(q) ||
        payment.transaction_ref.toLowerCase().includes(q),
    )
  }, [payments, searchQuery])

  const totalDue = useMemo(
    () => filtered.reduce((sum, payment) => sum + Number(payment.amount), 0),
    [filtered],
  )

  const customerName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
    : ""

  return (
    <div className="portal-account portal-payments portal-payments--pending">
      <header className="portal-account__header">
        <div style={{ display: "block", marginBottom: 12 }}>
          <PortalPageBack href="/customer" label="Home" />
        </div>
        <h1 className="portal-account__title">
          Pending payments
          <PortalPolicyInfoButton
            policy={LOGISTICS_SHIPPING_POLICY}
            label="Shipping and waybill policy"
          />
        </h1>
        <p className="portal-account__subtitle">
          Pay shipment balances to release your packages for delivery.
        </p>
      </header>

      {!loading && payments.length > 0 ? (
        <div className="portal-payments__summary portal-home__panel">
          <p className="portal-payments__summary-label">Total due</p>
          <p className="portal-payments__summary-value tabular-nums">
            {formatPaymentAmount(totalDue)}
          </p>
          <p className="portal-payments__summary-hint">
            {filtered.length} pending payment{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
      ) : null}

      <div className="portal-payments__filters portal-home__panel">
        <div className="portal-payments__filter-row portal-payments__filter-row--full">
          <label className="portal-packages__field-label" htmlFor="pending-search">
            Search
          </label>
          <input
            id="pending-search"
            type="search"
            className="portal-payments__input"
            placeholder="Tracking number or reference…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <p className="portal-payments__count">
        {loading
          ? "Loading…"
          : `${filtered.length} pending payment${filtered.length === 1 ? "" : "s"}`}
      </p>

      {loading ? (
        <div className="portal-packages__loading flex justify-center py-16">
          <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="portal-packages__empty portal-payments__empty">
          <IconCreditCard
            size={32}
            stroke={1.25}
            className="portal-payments__empty-icon"
            aria-hidden
          />
          <p>No pending payments.</p>
          <p className="portal-payments__empty-hint">
            {payments.length === 0
              ? "You're all caught up - nothing is waiting for payment."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <ul className="portal-payments__list">
          {filtered.map((payment) => (
            <li key={payment.id}>
              <article className="portal-payments__card portal-payments__card--pending">
                <div className="portal-payments__card-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.75rem", width: "100%" }}>
                  <div className="flex w-full justify-between items-center" style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="text-xs font-semibold text-dheir-muted">
                      Pay in Nigeria DHEIR receipt NO.: <span className="font-mono text-dheir-blue select-all" style={{ color: "var(--color-dheir-blue)" }}>{payment.shipment_tracking_number}</span>
                    </span>
                    <span
                      className={`portal-payments__status portal-payments__status--${payment.status === "awaiting_confirmation" ? "awaiting" : "pending"}`}
                    >
                      {paymentStatusLabel(payment.status)}
                    </span>
                  </div>
                </div>

                <p className="portal-payments__ref portal-payments__ref--sub">
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
                          <span>{Number((payment as any).air_gz_weight).toFixed(2)} KG {(payment as any).air_gz_cost ? `· ₦${Number((payment as any).air_gz_cost).toLocaleString("en-NG")}` : ""} {(payment as any).air_gz_expected_arrival_date ? `· EDD: ${(payment as any).air_gz_expected_arrival_date.split("T")[0]}` : ""}</span>
                        </div>
                      )}
                      {(payment as any).air_hk_weight != null && Number((payment as any).air_hk_weight) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                          <span style={{ color: "var(--color-dheir-orange)", fontWeight: 500 }}>✈️ Air HK (Sensitive):</span>
                          <span>{Number((payment as any).air_hk_weight).toFixed(2)} KG {(payment as any).air_hk_cost ? `· ₦${Number((payment as any).air_hk_cost).toLocaleString("en-NG")}` : ""} {(payment as any).air_hk_expected_arrival_date ? `· EDD: ${(payment as any).air_hk_expected_arrival_date.split("T")[0]}` : ""}</span>
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

                <div className="portal-payments__card-actions">
                  {payment.status === "awaiting_confirmation" ? (
                    <p className="portal-payments__pay-hint">
                      Your transfer proof is being verified. We will release this
                      shipment once confirmed.
                    </p>
                  ) : (
                    <>
                      <p className="portal-payments__pay-hint">
                        Pay now to release this shipment.
                      </p>
                      <div className="portal-payments__pay-options">
                        {bankTransferEnabled ? (
                          <Link
                            href={`/customer/payments/transfer/shipment/${encodeURIComponent(payment.transaction_ref)}`}
                            className="portal-payments__pay-btn portal-payments__pay-btn--bank dheir-btn-primary"
                          >
                            <IconBuildingBank size={18} stroke={1.5} aria-hidden />
                            Pay by transfer
                          </Link>
                        ) : null}
                        <div
                          className={
                            MONNIFY_ENABLED
                              ? "portal-payments__monnify-wrap"
                              : "portal-payments__monnify-wrap portal-payments__monnify-wrap--paused"
                          }
                          title={
                            MONNIFY_ENABLED
                              ? undefined
                              : "Card payments are temporarily unavailable"
                          }
                        >
                          <MonnifyPaymentButton
                            amount={payment.amount}
                            customerEmail={user?.email ?? ""}
                            customerName={customerName || user?.email || ""}
                            paymentReference={payment.transaction_ref}
                            className="portal-payments__pay-btn dheir-btn-primary"
                            disabled={!user?.email || !MONNIFY_ENABLED}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
