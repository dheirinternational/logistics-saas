"use client"

import { PortalOrderLineItem } from "@/components/portal/orders/PortalOrderLineItem"
import type { PortalOrderLineItemData } from "@/components/portal/orders/PortalOrderLineItem"
import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import {
  getOrderStatusLabel,
  getOrderStatusVariant,
} from "@/lib/portal/orderStatus"
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentStatusLabel,
} from "@/lib/portal/paymentDisplay"
import type { Order } from "@/types/entityTypeDef"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

export function PortalOrderDetailPage() {
  const params = useParams()
  const orderId = typeof params.id === "string" ? params.id : ""

  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<PortalOrderLineItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [latestSubmission, setLatestSubmission] = useState<{
    status: string
    admin_note: string | null
  } | null>(null)

  useEffect(() => {
    if (!orderId) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const [orderRes, itemsRes, manualRes] = await Promise.all([
          fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
            credentials: "include",
          }),
          fetch(`/api/orders/items/${encodeURIComponent(orderId)}`, {
            credentials: "include",
          }),
          fetch(`/api/manual-payments/order/${encodeURIComponent(orderId)}`, {
            credentials: "include",
          }),
        ])

        const orderResult = await orderRes.json()
        const itemsResult = await itemsRes.json()
        const manualResult = await manualRes.json()

        if (cancelled) return

        if (!orderRes.ok) {
          toast.error(orderResult.message ?? "Could not load order")
          setOrder(null)
        } else {
          setOrder(orderResult.data ?? null)
        }

        if (!itemsRes.ok) {
          toast.error(itemsResult.message ?? "Could not load order items")
          setOrderItems([])
        } else {
          setOrderItems(itemsResult.data ?? [])
        }

        if (manualRes.ok) {
          setLatestSubmission(manualResult.data?.latestSubmission ?? null)
        } else {
          setLatestSubmission(null)
        }
      } catch {
        if (!cancelled) toast.error("Could not load order details")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [orderId])

  const itemsSubtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + Number(item.subtotal), 0),
    [orderItems],
  )

  const deliveryFee = Number(order?.delivery_fee ?? 0)
  const subtotal =
    itemsSubtotal > 0
      ? itemsSubtotal
      : Math.max(0, Number(order?.total_price ?? 0) - deliveryFee)
  const totalPaid = Number(order?.total_price ?? subtotal + deliveryFee)
  const paymentStatus = order?.payment_status ?? "pending"

  return (
    <div className="portal-packages portal-orders portal-orders--detail">
      <PortalPackagesPageHeader
        title={order?.order_id ?? "Order"}
        description={
          order
            ? `Placed ${formatPaymentDate(order.created_at)}`
            : "Order details"
        }
        backHref="/customer/orders"
        backLabel="Orders"
      />

      {loading ? (
        <div className="portal-packages__loading">
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : !order ? (
        <div className="portal-packages__empty">
          <p>Order not found.</p>
        </div>
      ) : (
        <div className="portal-orders__layout">
          {latestSubmission?.status === "rejected" ? (
            <section className="portal-home__panel portal-bank-transfer__notice portal-bank-transfer__notice--reject portal-orders__notice">
              <span className="portal-payments__status portal-payments__status--failed">
                Rejected
              </span>
              <p className="portal-bank-transfer__notice-text">
                {latestSubmission.admin_note
                  ? latestSubmission.admin_note
                  : "Your transfer proof was rejected. Please submit a new receipt."}
              </p>
              <Link
                href={`/customer/payments/transfer/order/${encodeURIComponent(orderId)}`}
                className="portal-home__table-link"
              >
                Submit a new transfer proof
              </Link>
            </section>
          ) : null}
          <section className="portal-account__card portal-orders__section portal-orders__section--status">
            <div className="portal-orders__section-head">
              <h2 className="portal-account__card-title">Status</h2>
              {latestSubmission?.status === "rejected" ? (
                <span className="portal-payments__status portal-payments__status--failed">
                  Rejected
                </span>
              ) : paymentStatus === "paid" ? (
                <PortalPackageStatusBadge
                  label={getOrderStatusLabel(order.status)}
                  variant={getOrderStatusVariant(order.status)}
                />
              ) : (
                <span
                  className={`portal-payments__status portal-payments__status--${paymentStatus}`}
                >
                  {paymentStatusLabel(paymentStatus as any)}
                </span>
              )}
            </div>
            <div className="portal-packages__detail-grid portal-orders__meta">
              <div className="portal-packages__detail-row">
                <span className="portal-packages__detail-label">
                  Delivery address
                </span>
                <span>{order.destination_address}</span>
              </div>
              <div className="portal-packages__detail-row">
                <span className="portal-packages__detail-label">Payment</span>
                <span className="capitalize">{order.payment_type}</span>
              </div>
              <div className="portal-packages__detail-row">
                <span className="portal-packages__detail-label">Updated</span>
                <span>{formatPaymentDate(order.updated_at)}</span>
              </div>
            </div>
          </section>

          <section className="portal-account__card portal-orders__section portal-orders__section--items">
            <div className="portal-cart__items-head">
              <h2 className="portal-account__card-title">Items</h2>
              <p className="portal-cart__count">
                {orderItems.length} item{orderItems.length === 1 ? "" : "s"}
              </p>
            </div>

            {orderItems.length === 0 ? (
              <p className="portal-cart__empty">No line items for this order.</p>
            ) : (
              <div className="portal-cart__items-list">
                {orderItems.map((item) => (
                  <PortalOrderLineItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          <aside className="portal-account__card portal-orders__section portal-orders__section--summary">
            <h2 className="portal-account__card-title">Payment summary</h2>
            <div className="portal-cart__lines">
              <div className="portal-cart__line">
                <span>Subtotal ({orderItems.length} items)</span>
                <strong className="tabular-nums">
                  {formatPaymentAmount(subtotal)}
                </strong>
              </div>
              <div className="portal-cart__line">
                <span>Delivery fee</span>
                <strong className="tabular-nums">
                  {formatPaymentAmount(deliveryFee)}
                </strong>
              </div>
              <div className="portal-cart__line portal-cart__line--total">
                <span>
                  {paymentStatus === "paid" ? "Total paid" : "Total due"}
                </span>
                <strong className="tabular-nums">
                  {formatPaymentAmount(totalPaid)}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
