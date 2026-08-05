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
import type { Warehouse } from "@/types/entityTypeDef"
import type { AdminMediaItem } from "@/lib/media/adminMedia"
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal"
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal"
import Image from "next/image"

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

  // Form editable states
  const [trackingNumber, setTrackingNumber] = useState("")
  const [customerCode, setCustomerCode] = useState("")
  const [originWarehouseId, setOriginWarehouseId] = useState("")
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("")
  const [channel, setChannel] = useState("")
  const [totalCost, setTotalCost] = useState("")
  const [totalWeight, setTotalWeight] = useState("")
  const [totalWeightUnit, setTotalWeightUnit] = useState<"kg" | "cbm">("kg")
  const [paymentTime, setPaymentTime] = useState<"before" | "after">("before")
  const [paidFor, setPaidFor] = useState(false)
  const [status, setStatus] = useState<ShipmentStatus | "">("")
  const [shipmentNote, setShipmentNote] = useState("")
  const [adminReply, setAdminReply] = useState("")

  // Media states
  const [libraryMedia, setLibraryMedia] = useState<AdminMediaItem[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  // Warehouses list
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch(`/api/warehouses`)
        const result = await res.json()
        if (res.ok) {
          setWarehouses(result.data)
        }
      } catch (err) {
        console.error("Error fetching warehouses", err)
      }
    }
    fetchWarehouses()
  }, [])

  // Sync selected shipment to states
  useEffect(() => {
    if (selectedShipment) {
      setTrackingNumber(selectedShipment.tracking_number || "")
      setCustomerCode(selectedShipment.customer_code || "")
      const origId = Number(selectedShipment.origin_warehouse_id)
      const destId = Number(selectedShipment.destination_warehouse_id)
      setOriginWarehouseId(origId && origId >= 8 ? String(origId) : "8")
      setDestinationWarehouseId(destId && destId >= 8 ? String(destId) : (selectedShipment.channel === "sea" ? "11" : "10"))
      setChannel(selectedShipment.channel || "")
      setTotalCost(String(selectedShipment.total_cost || ""))
      setTotalWeight(String(selectedShipment.total_weight || ""))
      setTotalWeightUnit(selectedShipment.total_weight_unit || "kg")
      setPaymentTime(selectedShipment.payment_time || "before")
      setPaidFor(Boolean(selectedShipment.paid_for))
      setStatus(selectedShipment.status as ShipmentStatus)
      setShipmentNote(selectedShipment.shipment_note || "")
      setAdminReply(selectedShipment.admin_reply || "")

      // Map incoming media
      if (selectedShipment.images) {
        const mappedMedia: AdminMediaItem[] = selectedShipment.images.map((img: any, idx) => {
          const url = img.image_url || img.imageUrl || ""
          const isVideo = img.media_type === "video" || img.mediaType === "video" || /\.(mp4|webm|mov)$/i.test(url)
          return {
            id: img.id || idx + 10000,
            name: "shipment_media",
            path: "",
            publicUrl: url,
            mediaType: isVideo ? "video" : "photo",
            sizeBytes: 0,
            updatedAt: null,
          }
        })
        setLibraryMedia(mappedMedia)
      } else {
        setLibraryMedia([])
      }
    }
  }, [selectedShipment])

  const quantityLabel = useMemo(
    () =>
      channel
        ? getShippingQuantityFieldLabel(channel as any)
        : "Weight (kg)",
    [channel],
  )

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipment) return

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          customer_code: customerCode,
          origin_warehouse_id: Number(originWarehouseId),
          destination_warehouse_id: Number(destinationWarehouseId),
          channel,
          total_cost: Number(totalCost),
          total_weight: Number(totalWeight),
          total_weight_unit: totalWeightUnit,
          payment_time: paymentTime,
          paid_for: paidFor,
          status,
          shipment_note: shipmentNote,
          admin_reply: adminReply,
          media_asset_ids: libraryMedia.map((m) => m.id),
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message ?? "Could not save shipment changes")
        return
      }

      toast.success("Shipment updated successfully")
      setShipmentrigger()
      resetSelectedShipment()
      closeModal()
    } catch {
      toast.error("Could not save shipment changes")
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
    <form onSubmit={handleSaveChanges} className="admin-modal__form admin-shipment-view">
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
        {/* Left Column: Form Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="admin-modal__fields admin-shipment-view__grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Tracking number */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Tracking Number</span>
              <input
                type="text"
                className="dheir-input"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
              />
            </label>

            {/* Customer Code */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Customer code</span>
              <input
                type="text"
                className="dheir-input"
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                required
              />
            </label>

            {/* Shipping Channel */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Channel</span>
              <DHEIRSelect
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                required
              >
                <option value="air_gz">Air Gz</option>
                <option value="air_hk">Air HK</option>
                <option value="sea">Sea</option>
                <option value="express">Express</option>
              </DHEIRSelect>
            </label>

            {/* Origin Warehouse */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Origin warehouse</span>
              <DHEIRSelect
                value={originWarehouseId}
                onChange={(e) => setOriginWarehouseId(e.target.value)}
                required
              >
                <option value="">Select origin warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.country})
                  </option>
                ))}
              </DHEIRSelect>
            </label>

            {/* Destination Warehouse */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Destination warehouse</span>
              <DHEIRSelect
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                required
              >
                <option value="">Select destination warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.country})
                  </option>
                ))}
              </DHEIRSelect>
            </label>

            {/* Total Cost */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Total cost (₦)</span>
              <input
                type="number"
                className="dheir-input"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                required
              />
            </label>

            {/* Weight / Vol */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">{quantityLabel}</span>
              <input
                type="number"
                step="any"
                className="dheir-input"
                value={totalWeight}
                onChange={(e) => setTotalWeight(e.target.value)}
                required
              />
            </label>

            {/* Weight Unit */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Unit</span>
              <DHEIRSelect
                value={totalWeightUnit}
                onChange={(e) => setTotalWeightUnit(e.target.value as "kg" | "cbm")}
                required
              >
                <option value="kg">KG</option>
                <option value="cbm">CBM</option>
              </DHEIRSelect>
            </label>

            {/* Payment Timing */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Payment timing</span>
              <DHEIRSelect
                value={paymentTime}
                onChange={(e) => setPaymentTime(e.target.value as "before" | "after")}
                required
              >
                <option value="before">Pay before shipment</option>
                <option value="after">Pay after shipment</option>
              </DHEIRSelect>
            </label>

            {/* Payment Status */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Payment status</span>
              <DHEIRSelect
                value={paidFor ? "true" : "false"}
                onChange={(e) => setPaidFor(e.target.value === "true")}
                required
              >
                <option value="false">Pending</option>
                <option value="true">Paid</option>
              </DHEIRSelect>
            </label>
          </div>

          {/* Update status select */}
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

          {/* Customer Note (readonly) */}
          {selectedShipment.shipment_note ? (
            <div className="portal-packages__field">
              <span className="portal-packages__field-label">Customer note</span>
              <p className="admin-shipment-view__note">
                {selectedShipment.shipment_note}
              </p>
            </div>
          ) : null}

          {/* Admin Note / Reply (editable) */}
          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Admin Reply</span>
            <textarea
              className="dheir-input"
              style={{ minHeight: "80px", resize: "vertical", padding: "10px" }}
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder="Reply to customer note..."
              disabled={isUpdating}
            />
          </label>
        </div>

        {/* Right Column: Photos & Attached Media */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="admin-uploader" style={{ display: "flex", flexDirection: "column" }}>
            <div className="admin-uploader__row">
              <div>
                <p className="portal-packages__field-label" style={{ margin: 0 }}>
                  Photos
                </p>
                <p className="admin-uploader__help">
                  Optional, choose photos or videos from the media library.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="portal-home__btn portal-home__btn--secondary"
                  onClick={() => setPickerOpen(true)}
                >
                  Choose from library
                </button>
                <button
                  type="button"
                  className="portal-home__btn portal-home__btn--primary"
                  onClick={() => setUploadOpen(true)}
                >
                  Upload
                </button>
              </div>
            </div>

            {libraryMedia.length > 0 ? (
              <div className="admin-uploader__previews" style={{ marginTop: "0.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "0.5rem" }}>
                {libraryMedia.map((item) => (
                  <div
                    key={item.id}
                    className="admin-uploader__preview"
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "100%",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid var(--color-dheir-border, #e5e7eb)",
                    }}
                  >
                    {item.mediaType === "video" ? (
                      <video
                        src={item.publicUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="object-cover animate-fade-in"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                      />
                    ) : (
                      <Image src={item.publicUrl} alt="" fill className="object-cover animate-fade-in" unoptimized />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-uploader__help" style={{ marginTop: "1rem" }}>No media selected yet.</p>
            )}
          </div>
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        maxCount={8}
        minCount={0}
        initialSelected={libraryMedia}
        title="Shipment media"
        onClose={() => setPickerOpen(false)}
        onConfirm={setLibraryMedia}
      />

      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onFinished={(assets) => {
          setLibraryMedia((prev) => [...prev, ...assets])
          setUploadOpen(false)
        }}
      />

      <div className="admin-modal__actions" style={{ marginTop: "1.5rem" }}>
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
          type="submit"
          className="portal-home__btn portal-home__btn--primary"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <DHEIRLoader color="#fff" size={8} />
          ) : (
            "Save status"
          )}
        </button>
      </div>
    </form>
  )
}
