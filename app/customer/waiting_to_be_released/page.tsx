"use client"

import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { formatShippingQuantity } from "@/lib/shipping/channelUnits"
import type { ShippingRequest } from "@/types/entityTypeDef"
import Link from "next/link"
import { useEffect, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
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
            (x: ShippingRequest) =>
              x.status === "pending" ||
              x.status === "vetted" ||
              x.status === "rejected",
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
            <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : requests.length === 0 ? (
          <div className="portal-packages__empty">
            <p>No active shipment requests.</p>
            <Link href="/customer/request_mail" className="portal-packages__text-link">
              Ship my packages
            </Link>
          </div>
        ) : (
          requests.map((req) => {
            let badgeLabel = "Pending Review"
            let badgeVariant: any = "orange"

            if (req.status === "vetted") {
              badgeLabel = "Vetted (Processing)"
              badgeVariant = "blue"
            } else if (req.status === "rejected") {
              badgeLabel = "Rejected"
              badgeVariant = "muted"
            }

            return (
              <article key={req.id} className="portal-packages__card">
                <div className="portal-packages__card-head">
                  <div className="portal-packages__card-title-block">
                    <h3 className="portal-packages__card-title">
                      {req.channel.toUpperCase()} shipment
                    </h3>
                    <p className="portal-packages__card-meta">
                      {req.package_ids?.length ?? 0} package(s) · Pay{" "}
                      {req.payment_time?.replaceAll("_", " ")}
                    </p>
                  </div>
                  <PortalPackageStatusBadge label={badgeLabel} variant={badgeVariant} />
                </div>

                {req.customer_note && (
                  <div style={{ marginTop: 8, fontSize: "12px", color: "var(--color-dheir-muted)" }}>
                    <strong style={{ color: "var(--color-dheir-ink)" }}>Customer Note:</strong> {req.customer_note}
                  </div>
                )}

                {req.admin_reply && (
                  <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <p style={{ fontSize: "12px", color: "#166534", margin: 0 }}>
                      <strong>Admin Reply:</strong> {req.admin_reply}
                    </p>
                  </div>
                )}

                {(req.air_gz_cost || req.air_hk_cost || req.air_gz_weight || req.air_hk_weight) && (
                  <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>Flight Channel Breakdown:</span>
                    {req.air_gz_weight != null && Number(req.air_gz_weight) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span style={{ color: "var(--color-dheir-blue)", fontWeight: 500 }}>✈️ Air GZ (Normal):</span>
                        <span>{Number(req.air_gz_weight).toFixed(2)} KG {req.air_gz_cost ? `· ₦${Number(req.air_gz_cost).toLocaleString("en-NG")}` : ""} {req.air_gz_expected_arrival_date ? `· EDD: ${req.air_gz_expected_arrival_date.split("T")[0]}` : ""}</span>
                      </div>
                    )}
                    {req.air_hk_weight != null && Number(req.air_hk_weight) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                        <span style={{ color: "var(--color-dheir-orange)", fontWeight: 500 }}>✈️ Air HK (Sensitive):</span>
                        <span>{Number(req.air_hk_weight).toFixed(2)} KG {req.air_hk_cost ? `· ₦${Number(req.air_hk_cost).toLocaleString("en-NG")}` : ""} {req.air_hk_expected_arrival_date ? `· EDD: ${req.air_hk_expected_arrival_date.split("T")[0]}` : ""}</span>
                      </div>
                    )}
                  </div>
                )}

                {req.status === "rejected" && req.rejection_note && (
                  <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, backgroundColor: "#fef2f2", border: "1px solid #fee2e2" }}>
                    <p style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 500, margin: 0 }}>
                      <strong>Rejection reason:</strong> {req.rejection_note}
                    </p>
                  </div>
                )}

                <div className="portal-packages__card-foot portal-packages__card-foot--split" style={{ marginTop: 12 }}>
                  <span className="portal-packages__card-meta">
                    {formatShippingQuantity(req.total_weight, req.channel)}
                  </span>
                  <time dateTime={req.created_at}>
                    {new Date(req.created_at).toLocaleDateString()}
                  </time>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
