"use client"

import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { getShipmentStatusVariant } from "@/lib/portal/packageStatus"
import {
  formatShippingQuantity,
  getShippingQuantityShortLabel,
} from "@/lib/shipping/channelUnits"
import type {
  PortalTrackingData,
  PortalTrackingFilter,
  PortalTrackingShipment,
} from "@/lib/portal/tracking"
import { toast } from "@/lib/ui/toast"
import {
  IconMapPin,
  IconSearch,
  IconTruck,
  IconTruckDelivery,
  IconChecks,
  IconLayersLinked,
} from "@tabler/icons-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

const FILTER_OPTIONS: { value: PortalTrackingFilter; label: string }[] = [
  { value: "active", label: "In progress" },
  { value: "delivered", label: "Delivered" },
  { value: "all", label: "All" },
]

function formatStatus(status: string) {
  return status.replaceAll("_", " ")
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatNaira(amount: number) {
  if (!amount) return "-"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PortalHomeTrackingView() {
  const [filter, setFilter] = useState<PortalTrackingFilter>("active")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PortalTrackingData | null>(null)
  const [selected, setSelected] = useState("")

  const load = useCallback(async (nextFilter: PortalTrackingFilter) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/portal/tracking?filter=${nextFilter}`, {
        credentials: "include",
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        toast.error(result.message ?? "Could not load shipments")
        return
      }
      const payload = result.data as PortalTrackingData
      setData(payload)
      setSelected((prev) => {
        const stillThere = payload.shipments.some(
          (s) => s.trackingNumber === prev,
        )
        return stillThere ? prev : (payload.shipments[0]?.trackingNumber ?? "")
      })
    } catch {
      toast.error("Could not load shipments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(filter)
  }, [filter, load])

  const shipments = data?.shipments ?? []
  const summary = data?.summary ?? { active: 0, delivered: 0, total: 0 }

  const filtered = shipments.filter((s) =>
    s.trackingNumber.toLowerCase().includes(search.toLowerCase()),
  )

  const active =
    filtered.find((s) => s.trackingNumber === selected) ??
    filtered[0] ??
    null

  return (
    <div className="portal-home__tracking">
      <div className="portal-home__stats portal-home__stats--three" role="list">
        <div className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconTruckDelivery size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">In progress</span>
            <span className="portal-home__stat-card-value">{summary.active}</span>
            <span className="portal-home__stat-card-hint">
              Not delivered yet
            </span>
          </span>
        </div>

        <div className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconChecks size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Delivered</span>
            <span className="portal-home__stat-card-value">
              {summary.delivered}
            </span>
            <span className="portal-home__stat-card-hint">Completed</span>
          </span>
        </div>

        <div className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconLayersLinked size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Total</span>
            <span className="portal-home__stat-card-value">{summary.total}</span>
            <span className="portal-home__stat-card-hint">
              All shipments
            </span>
          </span>
        </div>
      </div>

      <div className="portal-home__tracking-controls">
        <div className="portal-home__tracking-filters" role="group" aria-label="Shipment filter">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`portal-home__tracking-filter${filter === opt.value ? " is-active" : ""}`}
              onClick={() => setFilter(opt.value)}
              aria-pressed={filter === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="portal-home__tracking-search">
          <IconSearch
            size={18}
            stroke={1.5}
            className="portal-home__tracking-search-icon"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking number…"
            className="portal-home__tracking-search-input"
          />
        </div>
      </div>

      <section className="portal-home__panel" aria-labelledby="tracking-list-heading">
        <div className="portal-home__panel-head">
          <div>
            <h2 id="tracking-list-heading" className="portal-home__section-title">
              Your shipments
            </h2>
            <p className="portal-home__section-sub">
              Track active and completed shipments in one place
            </p>
          </div>
          {filter === "active" && summary.active > 0 ? (
            <Link href="/customer/pending_payments" className="portal-home__text-link">
              Pending payments
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="portal-packages__loading portal-home__panel-empty">
            <DheirLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="portal-packages__empty portal-home__panel-empty">
            <p>
              {search
                ? "No shipments match your search."
                : filter === "delivered"
                  ? "No delivered shipments yet."
                  : "No shipments in this view."}
            </p>
            {filter === "active" ? (
              <Link href="/customer/request_mail" className="portal-cart__link">
                Request shipment
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="portal-home__ongoing-split portal-home__tracking-split">
            <ul className="portal-home__ongoing-list" role="list">
              {filtered.map((item) => (
                <TrackingListItem
                  key={item.trackingNumber}
                  item={item}
                  isSelected={item.trackingNumber === active?.trackingNumber}
                  onSelect={() => setSelected(item.trackingNumber)}
                />
              ))}
            </ul>

            {active ? <TrackingDetail shipment={active} /> : null}
          </div>
        )}
      </section>
    </div>
  )
}

function TrackingListItem({
  item,
  isSelected,
  onSelect,
}: {
  item: PortalTrackingShipment
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        className={`portal-home__ongoing-item${isSelected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        <span className="portal-home__ongoing-item-icon" aria-hidden>
          <IconTruck size={20} stroke={1.5} />
        </span>
        <span className="portal-home__ongoing-item-body">
          <span className="portal-home__ongoing-item-id">
            {item.trackingNumber}
          </span>
          <span className="portal-home__ongoing-item-route">
            <IconMapPin size={14} stroke={1.5} aria-hidden />
            {item.originLabel} → {item.destinationLabel}
          </span>
        </span>
        <PortalPackageStatusBadge
          label={formatStatus(item.status)}
          variant={getShipmentStatusVariant(item.status)}
        />
      </button>
    </li>
  )
}

function TrackingDetail({ shipment }: { shipment: PortalTrackingShipment }) {
  const needsPayment = !shipment.paidFor && shipment.status !== "delivered"

  return (
    <aside className="portal-home__ongoing-detail">
      <p className="portal-home__ongoing-detail-label">
        {shipment.status === "delivered" ? "Delivered" : "Shipment"}
      </p>
      <h3 className="portal-home__ongoing-detail-title">
        {shipment.trackingNumber}
      </h3>
      <div className="portal-home__ongoing-route-card">
        <span className="portal-home__ongoing-route-dot" />
        <div>
          <p className="portal-home__ongoing-route-from">
            {shipment.originLabel}
          </p>
          <p className="portal-home__ongoing-route-to">
            {shipment.destinationLabel}
          </p>
        </div>
      </div>
      {shipment.shippingNote ? (
        <p className="portal-home__tracking-note">{shipment.shippingNote}</p>
      ) : null}
      <dl className="portal-home__ongoing-meta">
        <div>
          <dt>Channel</dt>
          <dd>{shipment.channel?.toUpperCase() || "-"}</dd>
        </div>
        <div>
          <dt>{getShippingQuantityShortLabel(shipment.channel)}</dt>
          <dd>
            {formatShippingQuantity(shipment.totalWeight, shipment.channel)}
          </dd>
        </div>
        <div>
          <dt>Fee</dt>
          <dd>{formatNaira(shipment.totalCost)}</dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd>
            {shipment.paidFor
              ? "Paid"
              : `${shipment.paymentTime.replaceAll("_", " ") || "-"} (unpaid)`}
          </dd>
        </div>
        <div>
          <dt>Started</dt>
          <dd>{formatDate(shipment.createdAt)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className="capitalize">{formatStatus(shipment.status)}</dd>
        </div>
      </dl>
      {needsPayment ? (
        <Link
          href="/customer/pending_payments"
          className="portal-home__tracking-pay-link"
        >
          Complete payment
        </Link>
      ) : null}
    </aside>
  )
}
