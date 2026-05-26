"use client"

import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { getShipmentStatusVariant } from "@/lib/portal/packageStatus"
import type { PortalDashboardShipment } from "@/lib/portal/dashboard"
import { IconMapPin, IconTruck } from "@tabler/icons-react"
import Link from "next/link"
import { useState } from "react"

type PortalHomeOngoingSectionProps = {
  shipments: PortalDashboardShipment[]
}

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
  if (!amount) return "—"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PortalHomeOngoingSection({
  shipments,
}: PortalHomeOngoingSectionProps) {
  const [selected, setSelected] = useState(shipments[0]?.trackingNumber ?? "")

  const active =
    shipments.find((s) => s.trackingNumber === selected) ?? shipments[0] ?? null

  return (
    <section className="portal-home__panel" aria-labelledby="ongoing-heading">
      <div className="portal-home__panel-head">
        <div>
          <h2 id="ongoing-heading" className="portal-home__section-title">
            Ongoing delivery
          </h2>
          <p className="portal-home__section-sub">
            Shipments currently on the way to you
          </p>
        </div>
        <Link href="/base/orders_shipped" className="portal-home__text-link">
          View all
        </Link>
      </div>

      {shipments.length === 0 ? (
        <div className="portal-packages__empty portal-home__panel-empty">
          <p>No active shipments right now.</p>
          <Link href="/base/request_mail" className="portal-cart__link">
            Request shipment
          </Link>
        </div>
      ) : (
        <div className="portal-home__ongoing-split">
          <ul className="portal-home__ongoing-list" role="list">
            {shipments.map((item) => {
              const isSelected = item.trackingNumber === active?.trackingNumber
              return (
                <li key={item.trackingNumber}>
                  <button
                    type="button"
                    className={`portal-home__ongoing-item${isSelected ? " is-selected" : ""}`}
                    onClick={() => setSelected(item.trackingNumber)}
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
            })}
          </ul>

          {active ? (
            <aside className="portal-home__ongoing-detail">
              <p className="portal-home__ongoing-detail-label">On the way</p>
              <h3 className="portal-home__ongoing-detail-title">
                {active.trackingNumber}
              </h3>
              <div className="portal-home__ongoing-route-card">
                <span className="portal-home__ongoing-route-dot" />
                <div>
                  <p className="portal-home__ongoing-route-from">
                    {active.originLabel}
                  </p>
                  <p className="portal-home__ongoing-route-to">
                    {active.destinationLabel}
                  </p>
                </div>
              </div>
              <dl className="portal-home__ongoing-meta">
                <div>
                  <dt>Channel</dt>
                  <dd>{active.channel?.toUpperCase() || "—"}</dd>
                </div>
                <div>
                  <dt>Weight</dt>
                  <dd>{active.totalWeight ? `${active.totalWeight} kg` : "—"}</dd>
                </div>
                <div>
                  <dt>Fee</dt>
                  <dd>{formatNaira(active.totalCost)}</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>{active.paymentTime.replaceAll("_", " ") || "—"}</dd>
                </div>
                <div>
                  <dt>Started</dt>
                  <dd>{formatDate(active.createdAt)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className="capitalize">{formatStatus(active.status)}</dd>
                </div>
              </dl>
            </aside>
          ) : null}
        </div>
      )}
    </section>
  )
}
