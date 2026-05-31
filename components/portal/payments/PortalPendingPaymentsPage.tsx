"use client"

import MonnifyPaymentButton from "@/components/base/MonnifyPaymentBtn"
import { PortalPageBack } from "@/components/portal/PortalPageBack"
import { PortalPolicyInfoButton } from "@/components/portal/PortalPolicyInfoButton"
import { DheirLoader } from "@/components/ui/DheirLoader"
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
        <PortalPageBack href="/customer" label="Home" />
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
              ? "You're all caught up - nothing is waiting for payment."
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
                  <span
                    className={`portal-payments__status portal-payments__status--${payment.status === "awaiting_confirmation" ? "awaiting" : "pending"}`}
                  >
                    {paymentStatusLabel(payment.status)}
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
