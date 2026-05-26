"use client"

import { PortalPageBack } from "@/components/portal/PortalPageBack"
import { DheirLoader } from "@/components/ui/DheirLoader"
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
        <PortalPageBack href="/base" label="Home" />
        <h1 className="portal-account__title">Payment receipts</h1>
        <p className="portal-account__subtitle">
          Shipment payments you have made or started — filter by tracking number
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
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
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
                <div className="portal-payments__card-head">
                  <p className="portal-payments__ref">{payment.transaction_ref}</p>
                  <span
                    className={`portal-payments__status portal-payments__status--${payment.status}`}
                  >
                    {paymentStatusLabel(payment.status)}
                  </span>
                </div>

                <dl className="portal-payments__meta">
                  <div>
                    <dt>Amount</dt>
                    <dd className="tabular-nums">{formatPaymentAmount(payment.amount)}</dd>
                  </div>
                  <div>
                    <dt>Method</dt>
                    <dd>{payment.channel || "—"}</dd>
                  </div>
                  <div>
                    <dt>Date</dt>
                    <dd>
                      <time dateTime={payment.created_at}>
                        {formatPaymentDate(payment.created_at)}
                      </time>
                    </dd>
                  </div>
                  <div className="portal-payments__meta-wide">
                    <dt>Shipment</dt>
                    <dd className="portal-payments__tracking">
                      {payment.shipment_tracking_number}
                    </dd>
                  </div>
                </dl>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
