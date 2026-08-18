"use client"

import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { getShipmentStatusVariant } from "@/lib/portal/packageStatus"
import {
  formatShippingQuantity,
  getShippingQuantityShortLabel,
} from "@/lib/shipping/channelUnits"
import type { PortalDashboardShipment } from "@/lib/portal/dashboard"
import { IconMapPin, IconTruck } from "@tabler/icons-react"
import Link from "next/link"
import Image from "next/image"
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
  if (!amount) return "-"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

import { PortalMediaGalleryModal } from "@/components/portal/PortalMediaGalleryModal"

export function PortalHomeOngoingSection({
  shipments,
}: PortalHomeOngoingSectionProps) {
  const [selected, setSelected] = useState(shipments[0]?.trackingNumber ?? "")
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const active =
    shipments.find((s) => s.trackingNumber === selected) ?? shipments[0] ?? null

  const handleSelect = (trackingNumber: string) => {
    setSelected(trackingNumber)
    setTimeout(() => {
      const detailEl = document.getElementById("ongoing-detail-aside")
      if (detailEl) {
        detailEl.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 50)
  }

  const openGallery = (idx: number) => {
    setGalleryIndex(idx)
    setGalleryOpen(true)
  }

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
        <a href="/customer/orders_shipped" className="portal-home__text-link">
          View all
        </a>
      </div>

      {shipments.length === 0 ? (
        <div className="portal-packages__empty portal-home__panel-empty">
          <p>No active shipments right now.</p>
          <Link href="/customer/request_mail" className="portal-cart__link">
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
                    onClick={() => handleSelect(item.trackingNumber)}
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
            <aside id="ongoing-detail-aside" className="portal-home__ongoing-detail">
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
                  <dt>Tracking ID</dt>
                  <dd style={{ fontFamily: "monospace", userSelect: "all" }}>{active.trackingNumber}</dd>
                </div>
                <div>
                  <dt>Channel</dt>
                  <dd>{active.channel?.toUpperCase() || "-"}</dd>
                </div>
                <div>
                  <dt>{active.totalWeightUnit === "cbm" ? "Volume" : active.totalWeightUnit === "kg" ? "Weight" : getShippingQuantityShortLabel(active.channel)}</dt>
                  <dd>
                    {active.totalWeightUnit
                      ? `${Number(active.totalWeight).toFixed(2)} ${active.totalWeightUnit === "cbm" ? "CBM" : active.totalWeightUnit}`
                      : formatShippingQuantity(active.totalWeight, active.channel)}
                  </dd>
                </div>
                <div>
                  <dt>Fee</dt>
                  <dd>{formatNaira(active.totalCost)}</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>{active.paymentTime.replaceAll("_", " ") || "-"}</dd>
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
              {(active.airGzCost != null || active.airHkCost != null || active.airGzWeight != null || active.airHkWeight != null) && (
                <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>Flight Breakdown:</span>
                  {active.airGzWeight != null && active.airGzWeight > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                      <span style={{ color: "var(--color-dheir-blue)", fontWeight: 500 }}>Air GZ (Normal):</span>
                      <span>{active.airGzWeight.toFixed(2)} {(active.airGzWeightUnit ?? "kg").toUpperCase()} {active.airGzCost ? `· ${formatNaira(active.airGzCost)}` : ""} {active.airGzExpectedArrivalDate ? `· EDD: ${new Date(active.airGzExpectedArrivalDate).toLocaleDateString()}` : ""}</span>
                    </div>
                  )}
                  {active.airHkWeight != null && active.airHkWeight > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                      <span style={{ color: "var(--color-dheir-orange)", fontWeight: 500 }}>Air HK (Sensitive):</span>
                      <span>{active.airHkWeight.toFixed(2)} {(active.airHkWeightUnit ?? "kg").toUpperCase()} {active.airHkCost ? `· ${formatNaira(active.airHkCost)}` : ""} {active.airHkExpectedArrivalDate ? `· EDD: ${new Date(active.airHkExpectedArrivalDate).toLocaleDateString()}` : ""}</span>
                    </div>
                  )}
                </div>
              )}
              {active.shipmentNote && (
                <div style={{ marginTop: 12, fontSize: "13px", color: "var(--color-dheir-muted)" }}>
                  <strong style={{ color: "var(--color-dheir-ink)" }}>Customer Note:</strong> {active.shipmentNote}
                </div>
              )}
              {active.adminReply && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <p style={{ fontSize: "12px", color: "#166534", margin: 0 }}>
                    <strong>Admin Reply:</strong> {active.adminReply}
                  </p>
                </div>
              )}
              {active.images && active.images.length > 0 ? (
                <div style={{ marginTop: 16 }}>
                  <p className="portal-home__ongoing-detail-label" style={{ marginBottom: 8 }}>Shipment pictures</p>
                  <div className="portal-packages__card-images" style={{ minHeight: "auto" }}>
                    {active.images.map((img, idx) => (
                      <figure key={idx} className="portal-packages__card-thumb" style={{ width: 64, height: 64 }}>
                        {img.mediaType === "video" ? (
                          <video
                            src={img.imageUrl}
                            className="object-cover w-full h-full"
                            controls
                            preload="metadata"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => openGallery(idx)}
                            className="relative block w-full h-full border-0 p-0 m-0 background-none cursor-pointer"
                          >
                            <Image
                              src={img.imageUrl}
                              alt="Shipment media"
                              fill
                              className="object-cover"
                              sizes="64px"
                              unoptimized
                            />
                          </button>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>
      )}

      {active && active.images && (
        <PortalMediaGalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          images={active.images}
          initialIndex={galleryIndex}
        />
      )}
    </section>
  )
}
