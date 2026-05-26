"use client"

import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import {
  getPackageStatusLabel,
  getPackageStatusVariant,
} from "@/lib/portal/packageStatus"
import type { Package, PackageImage } from "@/types/entityTypeDef"
import Image from "next/image"
import { useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"

type PortalPackageCardProps = {
  packag: Package
}

export function PortalPackageCard({ packag }: PortalPackageCardProps) {
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

  return (
    <article className="portal-packages__card">
      <div className="portal-packages__card-head">
        <div className="portal-packages__card-title-block">
          <h3 className="portal-packages__card-title">{packag.package_name}</h3>
          <p className="portal-packages__card-meta">
            Tracking: {packag.incoming_package_id}
          </p>
        </div>
        <PortalPackageStatusBadge
          label={getPackageStatusLabel(packag.status)}
          variant={getPackageStatusVariant(packag.status)}
        />
      </div>

      <div className="portal-packages__card-foot">
        <div className="portal-packages__card-images">
          {loadingImages ? (
            <BeatLoader size={6} color="var(--color-dheir-blue)" />
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
