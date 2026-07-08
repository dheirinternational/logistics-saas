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
  const [warehouseName, setWarehouseName] = useState("")

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

  useEffect(() => {
    if (!packag.warehouse_id) return
    fetch(`/api/warehouses/${packag.warehouse_id}`, { credentials: "include" })
      .then(async (res) => {
        const result = await res.json()
        if (res.ok && result.data) {
          setWarehouseName(result.data.name)
        }
      })
      .catch(() => {})
  }, [packag.warehouse_id])

  return (
    <button
      type="button"
      className={`portal-request-mail__package${selected ? " is-selected" : ""}`}
      onClick={onToggle}
      aria-pressed={selected}
      style={{ textAlign: "left" }}
    >
      <span className="portal-request-mail__package-check" aria-hidden>
        {selected ? <IconCheck size={16} stroke={2.5} /> : null}
      </span>

      <div className="portal-request-mail__package-body">
        <div className="portal-request-mail__package-head" style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <p className="portal-request-mail__package-name" style={{ marginBottom: 8 }}>{packag.package_name}</p>
            <ul style={{
              listStyleType: "disc",
              paddingLeft: "1.1rem",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              fontSize: "12px",
              color: "var(--color-dheir-muted)"
            }}>
              <li>
                <span style={{ fontWeight: 600, color: "var(--color-dheir-ink)" }}>Tracking:</span>{" "}
                <span style={{ fontFamily: "monospace", userSelect: "all" }}>{packag.incoming_package_id}</span>
              </li>
              <li>
                <span style={{ fontWeight: 600, color: "var(--color-dheir-ink)" }}>Weight / Volume:</span>{" "}
                <span>
                  {Number(packag.weight).toFixed(2)} {packag.weight_unit || "kg"}
                </span>
              </li>
              <li>
                <span style={{ fontWeight: 600, color: "var(--color-dheir-ink)" }}>Quantity:</span>{" "}
                <span>{packag.amount} item{packag.amount === 1 ? "" : "s"}</span>
              </li>
              {packag.condition && (
                <li>
                  <span style={{ fontWeight: 600, color: "var(--color-dheir-ink)" }}>Condition:</span>{" "}
                  <span className="capitalize">{packag.condition}</span>
                </li>
              )}
              {warehouseName && (
                <li>
                  <span style={{ fontWeight: 600, color: "var(--color-dheir-ink)" }}>Warehouse:</span>{" "}
                  <span>{warehouseName}</span>
                </li>
              )}
              {packag.stored_at && (
                <li>
                  <span style={{ fontWeight: 600, color: "var(--color-dheir-ink)" }}>Stored:</span>{" "}
                  <span>{new Date(packag.stored_at).toLocaleDateString()}</span>
                </li>
              )}
            </ul>
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
