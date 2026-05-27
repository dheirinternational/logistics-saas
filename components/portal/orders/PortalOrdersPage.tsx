"use client"

import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { PortalPackagesToolbar } from "@/components/portal/packages/PortalPackagesToolbar"
import {
  getOrderStatusLabel,
  getOrderStatusVariant,
  ORDER_FILTER_OPTIONS,
} from "@/lib/portal/orderStatus"
import { formatPaymentAmount, paymentStatusLabel } from "@/lib/portal/paymentDisplay"
import type { Order } from "@/types/entityTypeDef"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import { useSearchParams } from "next/navigation"

export function PortalOrdersPage() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const transferSubmitted = searchParams.get("transfer") === "submitted"
  const transferReference = searchParams.get("reference")

  useEffect(() => {
    fetch("/api/orders/user", { credentials: "include" })
      .then(async (res) => {
        const result = await res.json()
        if (!res.ok) {
          toast.error(result.message ?? "Could not load orders")
          setOrders([])
          return
        }
        setOrders(result.data ?? [])
      })
      .catch(() => {
        toast.error("Could not load orders")
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSearch =
        !q ||
        order.order_id.toLowerCase().includes(q) ||
        order.destination_address.toLowerCase().includes(q)
      const matchesStatus =
        !status || order.status.toLowerCase() === status.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [orders, search, status])

  return (
    <div className="portal-packages portal-orders">
      <PortalPackagesPageHeader
        title="Shop orders"
        description="Marketplace purchases and delivery status."
      />

      {transferSubmitted ? (
        <section className="portal-home__panel portal-bank-transfer__notice portal-bank-transfer__notice--left">
          <span className="portal-payments__status portal-payments__status--awaiting_confirmation">
            Awaiting confirmation
          </span>
          <p className="portal-bank-transfer__notice-text">
            Your bank transfer proof has been submitted{transferReference ? ` for ${transferReference}` : ""}. An admin will confirm receipt and your order will move forward.
          </p>
        </section>
      ) : null}

      <PortalPackagesToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statusOptions={ORDER_FILTER_OPTIONS}
        searchPlaceholder="Search by order ID or address…"
      />

      <p className="portal-payments__count" aria-live="polite">
        {loading
          ? "Loading…"
          : `${filtered.length} order${filtered.length === 1 ? "" : "s"}`}
      </p>

      <div className="portal-packages__list">
        {loading ? (
          <div className="portal-packages__loading">
            <DheirLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="portal-packages__empty">
            <p>No orders found.</p>
            <Link href="/customer/shop" className="portal-packages__text-link">
              Browse the shop
            </Link>
          </div>
        ) : (
          filtered.map((order) => (
            <Link
              key={order.id}
              href={`/customer/orders/${order.order_id}`}
              className="portal-packages__card portal-packages__card--link"
            >
              <div className="portal-packages__card-head">
                <div className="portal-packages__card-title-block">
                  <h3 className="portal-packages__card-title">
                    {order.order_id}
                  </h3>
                  <p className="portal-packages__card-meta">
                    {order.destination_address}
                  </p>
                </div>
                {order.latest_manual_payment_status === "rejected" ? (
                  <span className="portal-payments__status portal-payments__status--failed">
                    Rejected
                  </span>
                ) : order.payment_status === "paid" ? (
                  <PortalPackageStatusBadge
                    label={getOrderStatusLabel(order.status)}
                    variant={getOrderStatusVariant(order.status)}
                  />
                ) : (
                  <span
                    className={`portal-payments__status portal-payments__status--${order.payment_status ?? "pending"}`}
                  >
                    {paymentStatusLabel((order.payment_status as any) ?? "pending")}
                  </span>
                )}
              </div>
              {/* Payment chip already shown in header to avoid double-status confusion. */}
              <div className="portal-packages__card-foot portal-packages__card-foot--split">
                <time dateTime={order.created_at}>
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span className="tabular-nums">
                  {formatPaymentAmount(Number(order.total_price))}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
