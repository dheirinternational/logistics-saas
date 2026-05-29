"use client"

import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import {
  getPackageStatusLabel,
  getPackageStatusVariant,
} from "@/lib/portal/packageStatus"
import { formatShippingQuantity } from "@/lib/shipping/channelUnits"
import type { Package, PackageImage } from "@/types/entityTypeDef"
import { IconCheck } from "@tabler/icons-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"

type PortalRequestMailPackageRowProps = {
  packag: Package
  selected: boolean
  onToggle: () => void
}

export function PortalRequestMailPackageRow({
  packag,
  selected,
  onToggle,
}: PortalRequestMailPackageRowProps) {
  const [images, setImages] = useState<PackageImage[]>([])
  const [loadingImages, setLoadingImages] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingImages(true)

    fetch(`/api/packages/images/${packag.id}`, { credentials: "include" })
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

  return (
    <button
      type="button"
      className={`portal-request-mail__package${selected ? " is-selected" : ""}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      <span className="portal-request-mail__package-check" aria-hidden>
        {selected ? <IconCheck size={16} stroke={2.5} /> : null}
      </span>

      <div className="portal-request-mail__package-body">
        <div className="portal-request-mail__package-head">
          <div>
            <p className="portal-request-mail__package-name">{packag.package_name}</p>
            <p className="portal-request-mail__package-meta">
              Tracking: {packag.incoming_package_id} ·{" "}
              {formatShippingQuantity(
                packag.weight,
                packag.weight_unit === "cbm" ? "sea" : "air",
                { decimals: 2 },
              )}
            </p>
          </div>
          <PortalPackageStatusBadge
            label={getPackageStatusLabel(packag.status)}
            variant={getPackageStatusVariant(packag.status)}
          />
        </div>

        <div className="portal-request-mail__package-foot">
          <div className="portal-request-mail__package-images">
            {loadingImages ? (
              <DheirLoader size={6} color="var(--color-dheir-blue)" />
            ) : images.length === 0 ? (
              <span className="portal-request-mail__package-no-img">No photos</span>
            ) : (
              images.map((image) => (
                <figure key={image.id} className="portal-request-mail__package-thumb">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || packag.package_name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </figure>
              ))
            )}
          </div>
          <time className="portal-request-mail__package-date" dateTime={packag.created_at}>
            {new Date(packag.created_at).toLocaleDateString()}
          </time>
        </div>
      </div>
    </button>
  )
}
