"use client"

import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { getShipmentStatusLabel, getShipmentStatusVariant } from "@/lib/portal/packageStatus"
import { formatPaymentAmount } from "@/lib/portal/paymentDisplay"
import {
  formatShippingChannel,
  formatShippingQuantity,
  getShippingQuantityFieldLabel,
} from "@/lib/shipping/channelUnits"
import { useShipmentStore } from "@/store/shipmentsStore"
import { useEditModalStore } from "@/types/editModalStore"
import type { ShipmentStatus } from "@/types/statusTypes"
import { useEffect, useMemo, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"
import { DHEIRSelect } from "@/components/ui/DHEIRSelect"

const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "processing",
  "shipped",
  "in_transit",
  "arrived",
  "out_for_delivery",
  "delivered",
]

function formatPaymentTiming(value: string) {
  return value.split("_").join(" ")
}

export function AdminShipmentViewModal() {
  const { selectedShipment, resetSelectedShipment, setShipmentrigger } =
    useShipmentStore()
  const closeModal = useEditModalStore((s) => s.closeModal)

  const [status, setStatus] = useState<ShipmentStatus | "">("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (selectedShipment?.status) {
      setStatus(selectedShipment.status as ShipmentStatus)
    }
  }, [selectedShipment])

  const quantityLabel = useMemo(
    () =>
      selectedShipment
        ? getShippingQuantityFieldLabel(selectedShipment.channel)
        : "Weight (kg)",
    [selectedShipment],
  )

  const handleUpdateStatus = async () => {
    if (!selectedShipment || !status || status === selectedShipment.status) {
      return
    }

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/shipments/update-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedShipment.id,
          status,
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message ?? "Could not update status")
        return
      }

      toast.success(result.message ?? "Shipment status updated")
      setShipmentrigger()
      resetSelectedShipment()
      closeModal()
    } catch {
      toast.error("Could not update shipment status")
    } finally {
      setIsUpdating(false)
    }
  }

  if (!selectedShipment) {
    return (
      <div className="portal-home__panel-empty">
        <p className="portal-home__section-sub">
          Select a shipment from the table to view details.
        </p>
      </div>
    )
  }

  const statusVariant = getShipmentStatusVariant(selectedShipment.status)

  return (
    <div className="admin-modal__form admin-shipment-view">
      <div className="admin-shipment-view__head">
        <div>
          <p className="admin-shipment-view__eyebrow">Tracking</p>
          <p className="admin-shipment-view__tracking">
            {selectedShipment.tracking_number}
          </p>
        </div>
        <PortalPackageStatusBadge
          label={getShipmentStatusLabel(selectedShipment.status)}
          variant={statusVariant}
        />
      </div>

      <div className="admin-modal__fields admin-shipment-view__grid">
        <div className="portal-packages__field">
          <span className="portal-packages__field-label">Customer code</span>
          <p className="admin-shipment-view__value">
            {selectedShipment.customer_code || "-"}
          </p>
        </div>
        <div className="portal-packages__field">
          <span className="portal-packages__field-label">Channel</span>
          <p className="admin-shipment-view__value capitalize">
            {formatShippingChannel(selectedShipment.channel)}
          </p>
        </div>
        <div className="portal-packages__field">
          <span className="portal-packages__field-label">Origin warehouse</span>
          <p className="admin-shipment-view__value">
            {selectedShipment.origin_warehouse_id ?? "-"}
          </p>
        </div>
        <div className="portal-packages__field">
          <span className="portal-packages__field-label">
            Destination warehouse
          </span>
          <p className="admin-shipment-view__value">
            {selectedShipment.destination_warehouse_id ?? "-"}
          </p>
        </div>
        <div className="portal-packages__field">
          <span className="portal-packages__field-label">Total cost</span>
          <p className="admin-shipment-view__value tabular-nums">
            {formatPaymentAmount(Number(selectedShipment.total_cost))}
          </p>
        </div>
        <div className="portal-packages__field">
          <span className="portal-packages__field-label">{quantityLabel}</span>
          <p className="admin-shipment-view__value tabular-nums">
            {formatShippingQuantity(
              selectedShipment.total_weight,
              selectedShipment.channel,
            )}
          </p>
        </div>
      </div>

      <div className="admin-shipment-view__payment portal-home__panel">
        <div className="portal-packages__detail-row">
          <span className="portal-packages__detail-label">Payment timing</span>
          <span className="capitalize">
            {formatPaymentTiming(selectedShipment.payment_time)}
          </span>
        </div>
        <div className="portal-packages__detail-row">
          <span className="portal-packages__detail-label">Payment status</span>
          <span>{selectedShipment.paid_for ? "Paid" : "Pending"}</span>
        </div>
      </div>

      {(selectedShipment.shipment_note || selectedShipment.shipping_note) ? (
        <div className="portal-packages__field">
          <span className="portal-packages__field-label">Customer note</span>
          <p className="admin-shipment-view__note">
            {selectedShipment.shipment_note || selectedShipment.shipping_note}
          </p>
        </div>
      ) : null}

      {selectedShipment.images && selectedShipment.images.length > 0 ? (
        <div className="portal-packages__field">
          <span className="portal-packages__field-label">Attached media</span>
          <div className="admin-uploader__previews" style={{ marginTop: "0.5rem" }}>
            {selectedShipment.images.map((img, idx) => {
              const url = (img as any).image_url || (img as any).imageUrl || ""
              const type = (img as any).media_type || (img as any).mediaType || ""
              const isVideo = type === "video" || /\.(mp4|webm|mov)$/i.test(url)

              return (
                <div key={idx} className="admin-uploader__preview" style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-dheir-border, #e5e7eb)" }}>
                  {isVideo ? (
                    <video
                      src={url}
                      muted
                      controls
                      playsInline
                      className="object-cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Shipment media ${idx + 1}`} className="object-cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="portal-packages__field">
        <label className="portal-packages__field-label" htmlFor="shipment-status">
          Update status
        </label>
        <DHEIRSelect
          id="shipment-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
          disabled={isUpdating}
        >
          {SHIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getShipmentStatusLabel(s)}
            </option>
          ))}
        </DHEIRSelect>
      </div>

      <div className="admin-modal__actions">
        <button
          type="button"
          className="portal-home__btn portal-home__btn--secondary"
          onClick={() => {
            resetSelectedShipment()
            closeModal()
          }}
          disabled={isUpdating}
        >
          Close
        </button>
        <button
          type="button"
          className="portal-home__btn portal-home__btn--primary"
          onClick={handleUpdateStatus}
          disabled={
            isUpdating ||
            !status ||
            status === selectedShipment.status
          }
        >
          {isUpdating ? (
            <DHEIRLoader color="#fff" size={8} />
          ) : (
            "Save status"
          )}
        </button>
      </div>
    </div>
  )
}
