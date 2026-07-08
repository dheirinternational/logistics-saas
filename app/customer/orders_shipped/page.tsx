"use client"

import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { PortalPackagesToolbar } from "@/components/portal/packages/PortalPackagesToolbar"
import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import type { Shipment } from "@/types/entityTypeDef"
import { useEffect, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import Image from "next/image"

import { PortalMediaGalleryModal } from "@/components/portal/PortalMediaGalleryModal"

export default function TrackShipmentsPage() {
  const [search, setSearch] = useState("")
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [activeImages, setActiveImages] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/shipments/user", { credentials: "include" })
      .then(async (res) => {
        const result = await res.json()
        if (!res.ok) {
          toast.error(result.message)
          return
        }
        setShipments(
          (result.data ?? []).filter(
            (s: Shipment) => s.status !== "delivered",
          ),
        )
      })
      .catch(() => toast.error("Could not load shipments"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = shipments.filter((s) =>
    s.tracking_number.toLowerCase().includes(search.toLowerCase()),
  )

  const openGallery = (images: any[], idx: number) => {
    setActiveImages(images)
    setGalleryIndex(idx)
    setGalleryOpen(true)
  }

  return (
    <div className="portal-packages">
      <PortalPackagesPageHeader
        title="Track shipment"
        description="Active shipments on the way to Nigeria."
        backHref="/customer"
        backLabel="Home"
      />

      <PortalPackagesToolbar
        search={search}
        onSearchChange={setSearch}
        status=""
        onStatusChange={() => {}}
        statusOptions={[{ value: "", label: "All in progress" }]}
        searchPlaceholder="Search by tracking number…"
      />

      <div className="portal-packages__list">
        {loading ? (
          <div className="portal-packages__loading">
            <DheirLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="portal-packages__empty">
            <p>No active shipments found.</p>
          </div>
        ) : (
          filtered.map((s: any) => (
            <article key={s.tracking_number} className="portal-packages__card">
              <div className="portal-packages__card-head">
                <div className="portal-packages__card-title-block">
                  <h3 className="portal-packages__card-title">
                    {s.tracking_number}
                  </h3>
                  <p className="portal-packages__card-meta">
                    {s.channel?.toUpperCase()} · {s.payment_time} payment
                  </p>
                </div>
                <PortalPackageStatusBadge
                  label={s.status.replaceAll("_", " ")}
                  variant="blue"
                />
              </div>

              <div className="portal-packages__card-details mt-4 pt-4 border-t border-[var(--color-dheir-border)]">
                <ul className="space-y-2 text-sm text-dheir-muted list-none p-0 m-0">
                  {s.origin_warehouse_name && s.destination_warehouse_name && (
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-dheir-ink">Route:</span>
                      <span>{s.origin_warehouse_name} → {s.destination_warehouse_name}</span>
                    </li>
                  )}
                  {(s.total_weight || s.total_weight === 0) && (
                    <li className="flex items-center gap-2">
                      <span className="font-semibold text-dheir-ink">Weight / Volume:</span>
                      <span>{Number(s.total_weight).toFixed(2)} {s.total_weight_unit || "kg"}</span>
                    </li>
                  )}
                  {s.total_cost && (
                    <li className="flex items-center gap-2">
                      <span className="font-semibold text-dheir-ink">Fee:</span>
                      <span>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(s.total_cost)}</span>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span className="font-semibold text-dheir-ink">Payment Status:</span>
                    <span className={s.paid_for ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                      {s.paid_for ? "Paid" : "Unpaid / Pending"}
                    </span>
                  </li>
                  {s.shipment_note && (
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-dheir-ink">Note:</span>
                      <span>{s.shipment_note}</span>
                    </li>
                  )}
                </ul>
              </div>

              {s.images && s.images.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--color-dheir-border)]">
                  <p className="text-xs font-semibold text-dheir-ink mb-2">Shipment Photos / Videos</p>
                  <div className="portal-packages__card-images flex flex-wrap gap-2" style={{ minHeight: "auto" }}>
                    {s.images.map((img: any, idx: number) => (
                      <figure key={idx} className="portal-packages__card-thumb relative w-16 h-16 border rounded overflow-hidden">
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
                            onClick={() => openGallery(s.images, idx)}
                            className="relative block w-full h-full border-0 p-0 m-0 background-none cursor-pointer"
                          >
                            <Image
                              src={img.imageUrl}
                              alt="Shipment attachment"
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
              )}

              <div className="portal-packages__card-foot mt-4 border-t border-[var(--color-dheir-border)] pt-4">
                <time dateTime={s.created_at}>
                  Created {new Date(s.created_at).toLocaleDateString()}
                </time>
              </div>
            </article>
          ))
        )}
      </div>

      <PortalMediaGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={activeImages}
        initialIndex={galleryIndex}
      />
    </div>
  )
}
