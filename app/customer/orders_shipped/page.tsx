"use client"

import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { PortalPackagesToolbar } from "@/components/portal/packages/PortalPackagesToolbar"
import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import type { Shipment } from "@/types/entityTypeDef"
import { useEffect, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

export default function TrackShipmentsPage() {
  const [search, setSearch] = useState("")
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)

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
          filtered.map((s) => (
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
              <div className="portal-packages__card-foot">
                <time dateTime={s.created_at}>
                  Created {new Date(s.created_at).toLocaleDateString()}
                </time>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
