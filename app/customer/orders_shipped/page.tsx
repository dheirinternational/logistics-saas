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
import { PortalShipmentTimeline } from "@/components/portal/packages/PortalShipmentTimeline"

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
              <div className="portal-packages__card-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.75rem", width: "100%" }}>
                <div className="flex w-full justify-between items-center" style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="text-xs font-semibold text-dheir-muted">
                    Pay in Nigeria DHEIR receipt NO.: <span className="font-mono text-dheir-blue select-all" style={{ color: "var(--color-dheir-blue)" }}>{s.tracking_number}</span>
                  </span>
                  <PortalPackageStatusBadge
                    label={s.status.replaceAll("_", " ")}
                    variant="blue"
                  />
                </div>
              </div>

              <div className="portal-packages__card-details mt-4 pt-4 border-t border-[var(--color-dheir-border)]">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", fontSize: "0.875rem" }}>
                  {/* Left Column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div>
                      <span className="text-dheir-muted">tracking: </span>
                      <span className="font-semibold text-dheir-ink capitalize">{s.channel || "skyjet"}</span>
                    </div>
                    <div>
                      <span className="text-dheir-muted">Weight: </span>
                      <span className="font-semibold text-dheir-ink">
                        {s.total_weight_unit === "cbm" ? "0.00" : Number(s.total_weight || 0).toFixed(2)}KG
                      </span>
                    </div>
                    <div>
                      <span className="text-dheir-muted">Unit price: </span>
                      <span className="font-semibold text-dheir-ink">
                        {s.total_weight_unit === "cbm" 
                          ? "₦0.00" 
                          : s.total_weight && Number(s.total_weight) > 0
                            ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(s.total_cost) / Number(s.total_weight))
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
                      <span className="font-semibold text-dheir-ink">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div>
                      <span className="text-dheir-muted">Total: </span>
                      <span className="font-semibold text-dheir-ink">{s.package_ids?.length || 1}</span>
                    </div>
                    {s.total_weight_unit === "cbm" ? (
                      <>
                        <div>
                          <span className="text-dheir-muted">Cube: </span>
                          <span className="font-semibold text-dheir-ink">{Number(s.total_weight || 0).toFixed(3)}m3</span>
                        </div>
                        <div>
                          <span className="text-dheir-muted">Unit price: </span>
                          <span className="font-semibold text-dheir-ink">
                            {s.total_weight && Number(s.total_weight) > 0
                              ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(s.total_cost) / Number(s.total_weight))
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
                        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(s.total_cost || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-dheir-muted">outbound: </span>
                      <span className="font-semibold text-dheir-ink">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--color-dheir-border)", display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8rem" }}>
                  {s.origin_warehouse_name && s.destination_warehouse_name && (
                    <div>
                      <span className="font-semibold text-dheir-ink">Route: </span>
                      <span className="text-dheir-muted">{s.origin_warehouse_name} → {s.destination_warehouse_name}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-dheir-ink">Payment Status: </span>
                    <span className={s.paid_for ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                      {s.paid_for ? "Paid" : "Unpaid / Pending"}
                    </span>
                  </div>
                  {s.shipment_note && (
                    <div>
                      <span className="font-semibold text-dheir-ink">Note: </span>
                      <span className="text-dheir-muted">{s.shipment_note}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-dheir-border)" }}>
                <PortalShipmentTimeline shipment={s} />
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
