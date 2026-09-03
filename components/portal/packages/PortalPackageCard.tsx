"use client"

import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import {
  getPackageStatusLabel,
  getPackageStatusVariant,
} from "@/lib/portal/packageStatus"
import type { Package, PackageImage } from "@/types/entityTypeDef"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { PortalPackageTimeline } from "@/components/portal/packages/PortalPackageTimeline"

type PortalPackageCardProps = {
  packag: Package
  warehousesMap?: Record<number, string>
}

export function PortalPackageCard({ packag, warehousesMap }: PortalPackageCardProps) {
  const [images, setImages] = useState<PackageImage[]>([])
  const [loadingImages, setLoadingImages] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingImages(true)

    fetch(`/api/packages/images/${packag.id}`)
      .then(async (res) => {
        const result = await res.json()
        if (!res.ok || cancelled) return
        setImages(result.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setImages([])
      })
      .finally(() => {
        if (!cancelled) setLoadingImages(false)
      })

    return () => {
      cancelled = true
    }
  }, [packag.id])

  const whName = packag.warehouse_id && warehousesMap?.[packag.warehouse_id] ? warehousesMap[packag.warehouse_id] : ""

  const timelineData = useMemo(
    () => ({
      status: packag.status,
      created_at: packag.created_at,
      stored_at: packag.stored_at,
      received_at: packag.received_at,
      warehouse_name: whName,
    }),
    [packag.status, packag.created_at, packag.stored_at, packag.received_at, whName]
  )

  return (
    <article className="portal-packages__card">
      <div className="portal-packages__card-head">
        <div className="portal-packages__card-title-block">
          <h3 className="portal-packages__card-title">{packag.package_name}</h3>
        </div>
        <PortalPackageStatusBadge
          label={getPackageStatusLabel(packag.status)}
          variant={getPackageStatusVariant(packag.status)}
        />
      </div>

      <div className="portal-packages__card-body">
        <ul className="portal-packages__details-list">
          <li><strong>Tracking:</strong> {packag.incoming_package_id}</li>
          <li><strong>Weight:</strong> {packag.weight} {packag.weight_unit || "kg"}</li>
          <li><strong>Quantity:</strong> {packag.amount} {Number(packag.amount) === 1 ? "item" : "items"}</li>
          <li><strong>Condition:</strong> <span className={`condition-${packag.condition}`}>{packag.condition}</span></li>
          {whName && (
            <li><strong>Warehouse:</strong> {whName}</li>
          )}
        </ul>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-dheir-border)" }}>
          <PortalPackageTimeline packag={timelineData} />
        </div>
      </div>

      <div className="portal-packages__card-foot">
        <div className="portal-packages__card-images">
          {loadingImages ? (
            <DHEIRLoader size={6} color="var(--color-dheir-blue)" />
          ) : images.length === 0 ? (
            <span className="portal-packages__card-no-img">No photos yet</span>
          ) : (
            images.map((image) => (
              <figure
                key={image.id}
                className="portal-packages__card-thumb"
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || packag.package_name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </figure>
            ))
          )}
        </div>
        <time className="portal-packages__card-date" dateTime={packag.created_at}>
          Added {new Date(packag.created_at).toLocaleDateString()}
        </time>
      </div>
    </article>
  )
}
