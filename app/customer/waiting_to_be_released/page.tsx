"use client"

import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { formatShippingQuantity } from "@/lib/shipping/channelUnits"
import type { ShippingRequest } from "@/types/entityTypeDef"
import Link from "next/link"
import { useEffect, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

export default function ShipmentRequestsPage() {
  const [requests, setRequests] = useState<ShippingRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/shipment-requests/user", { credentials: "include" })
      .then(async (res) => {
        const result = await res.json()
        if (!res.ok) {
          toast.error(result.message)
          return
        }
        setRequests(
          (result.data ?? []).filter(
            (x: ShippingRequest) => x.status === "pending",
          ),
        )
      })
      .catch(() => toast.error("Could not load shipment requests"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="portal-packages">
      <PortalPackagesPageHeader
        title="Shipment requests"
        description="Requests waiting for DHEIR to accept and release."
        action={
          <Link href="/customer/request_mail" className="portal-packages__btn-primary">
            New request
          </Link>
        }
      />

      <div className="portal-packages__list">
        {loading ? (
          <div className="portal-packages__loading">
            <DheirLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : requests.length === 0 ? (
          <div className="portal-packages__empty">
            <p>No pending shipment requests.</p>
            <Link href="/customer/request_mail" className="portal-packages__text-link">
              Ship my packages
            </Link>
          </div>
        ) : (
          requests.map((req) => (
            <article key={req.id} className="portal-packages__card">
              <div className="portal-packages__card-head">
                <div className="portal-packages__card-title-block">
                  <h3 className="portal-packages__card-title">
                    {req.channel.toUpperCase()} shipment
                  </h3>
                  <p className="portal-packages__card-meta">
                    {req.package_ids?.length ?? 0} package(s) · Pay{" "}
                    {req.payment_time}
                  </p>
                </div>
                <PortalPackageStatusBadge label="Pending" variant="orange" />
              </div>
              <div className="portal-packages__card-foot portal-packages__card-foot--split">
                <span className="portal-packages__card-meta">
                  {formatShippingQuantity(req.total_weight, req.channel)}
                </span>
                <time dateTime={req.created_at}>
                  {new Date(req.created_at).toLocaleDateString()}
                </time>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
