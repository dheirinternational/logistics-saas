"use client"

import MonnifyPaymentButton from "@/components/base/MonnifyPaymentBtn"
import { PortalPageBack } from "@/components/portal/PortalPageBack"
import { DheirLoader } from "@/components/ui/DheirLoader"
import {
  formatPaymentAmount,
  formatPaymentDate,
} from "@/lib/portal/paymentDisplay"
import type { Payment, User } from "@/types/entityTypeDef"
import { IconCreditCard } from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/ui/toast"

export function PortalPendingPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const [userRes, paymentsRes] = await Promise.all([
        fetch("/api/users/my-data", { credentials: "include" }),
        fetch("/api/payments/user", { credentials: "include" }),
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

      setPayments(
        (paymentsData.data ?? []).filter(
          (payment: Payment) => payment.status === "pending",
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
        <PortalPageBack href="/base" label="Home" />
        <h1 className="portal-account__title">Pending payments</h1>
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
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
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
              ? "You're all caught up — nothing is waiting for payment."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <ul className="portal-payments__list">
          {filtered.map((payment) => (
            <li key={payment.id}>
              <article className="portal-payments__card portal-payments__card--pending">
                <div className="portal-payments__card-head">
                  <p className="portal-payments__tracking portal-payments__tracking--title">
                    {payment.shipment_tracking_number}
                  </p>
                  <span className="portal-payments__status portal-payments__status--pending">
                    Pending
                  </span>
                </div>

                <p className="portal-payments__ref portal-payments__ref--sub">
                  Ref {payment.transaction_ref}
                </p>

                <dl className="portal-payments__meta">
                  <div>
                    <dt>Amount due</dt>
                    <dd className="portal-payments__amount tabular-nums">
                      {formatPaymentAmount(payment.amount)}
                    </dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>
                      <time dateTime={payment.created_at}>
                        {formatPaymentDate(payment.created_at)}
                      </time>
                    </dd>
                  </div>
                  {payment.channel ? (
                    <div>
                      <dt>Method</dt>
                      <dd>{payment.channel}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="portal-payments__card-actions">
                  <p className="portal-payments__pay-hint">
                    Pay now to release this shipment.
                  </p>
                  <MonnifyPaymentButton
                    amount={payment.amount}
                    customerEmail={user?.email ?? ""}
                    customerName={customerName || user?.email || ""}
                    paymentReference={payment.transaction_ref}
                    className="portal-payments__pay-btn dheir-btn-primary"
                    disabled={!user?.email}
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
