"use client"

import { FormEvent, useEffect, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { DHEIRSelect } from "@/components/ui/DHEIRSelect"
import { toast } from "@/lib/ui/toast"
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal"
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal"
import type { AdminMediaItem } from "@/lib/media/adminMedia"
import Image from "next/image"
import { FaImage } from "react-icons/fa"

type Customer = {
  id: number
  email: string
  first_name: string
  last_name: string
  code: string
}

type StoredPackage = {
  id: number
  package_name: string
  incoming_package_id: string
  customer_code: string
  status: string
  weight: number
  weight_unit: "kg" | "cbm"
}

type Warehouse = {
  id: number
  name: string
  country: string
}

type CreateManualShipmentModalProps = {
  onClose: () => void
  onSuccess: () => void
  preloadedCustomers?: Customer[]
  preloadedPackages?: StoredPackage[]
  preloadedWarehouses?: Warehouse[]
}

export default function CreateManualShipmentModal({
  onClose,
  onSuccess,
  preloadedCustomers,
  preloadedPackages,
  preloadedWarehouses,
}: CreateManualShipmentModalProps) {
  const [customers, setCustomers] = useState<Customer[]>(preloadedCustomers || [])
  const [packages, setPackages] = useState<StoredPackage[]>(preloadedPackages || [])
  const [warehouses, setWarehouses] = useState<Warehouse[]>(preloadedWarehouses || [])
  const [loading, setLoading] = useState(!preloadedCustomers || !preloadedPackages || !preloadedWarehouses)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [customerCode, setCustomerCode] = useState("")
  const [selectedPackages, setSelectedPackages] = useState<number[]>([])
  const [channel, setChannel] = useState<"air_gz" | "air_hk" | "sea" | "express">("air_gz")
  const [originWarehouseId, setOriginWarehouseId] = useState("")
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("")
  const [totalPrice, setTotalPrice] = useState("")
  const [totalWeight, setTotalWeight] = useState("")
  const [weightUnit, setWeightUnit] = useState<"kg" | "cbm" | "">("")
  const [paymentTime, setPaymentTime] = useState<"pay_before_shipment" | "pay_after_shipment">("pay_before_shipment")
  const [shipmentNote, setShipmentNote] = useState("")

  // Media picker states
  const [libraryMedia, setLibraryMedia] = useState<AdminMediaItem[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    if (preloadedCustomers && preloadedPackages && preloadedWarehouses) {
      setCustomers(preloadedCustomers)
      setPackages(preloadedPackages)
      setWarehouses(preloadedWarehouses)
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        const [usersRes, pkgsRes, whsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/packages"),
          fetch("/api/warehouses")
        ])
        const usersData = await usersRes.json()
        const pkgsData = await pkgsRes.json()
        const whsData = await whsRes.json()

        if (usersData.success) setCustomers(usersData.data || [])
        if (pkgsData.success) setPackages(pkgsData.data || [])
        if (whsData.success) setWarehouses(whsData.data || [])
      } catch (err) {
        console.error("Error loading data", err)
        toast.error("Failed to load required data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [preloadedCustomers, preloadedPackages, preloadedWarehouses])
  useEffect(() => {
    if (channel === "sea") {
      setWeightUnit("cbm")
    } else {
      setWeightUnit("kg")
    }
  }, [channel])

  // Filter packages for selected customer code that are in "stored" status
  const availablePackages = packages.filter(
    (p) => p.customer_code === customerCode && p.status === "stored"
  )

  const handleTogglePackage = (id: number) => {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!customerCode) {
      toast.error("Please select a customer")
      return
    }
    if (selectedPackages.length === 0) {
      toast.error("Please select at least one package")
      return
    }
    if (!originWarehouseId || !destinationWarehouseId) {
      toast.error("Please select origin and destination warehouses")
      return
    }
    if (Number(totalPrice) < 1 || Number(totalWeight) < 0.01) {
      toast.error("Please enter a valid price and weight")
      return
    }
    if (libraryMedia.length === 0) {
      toast.error("Select at least one photo or video from the media library")
      return
    }

    setSubmitting(true)
    try {
      const selectedUser = customers.find((c) => c.code === customerCode)
      if (!selectedUser) {
        toast.error("Selected customer not found")
        return
      }

      // Step 1: Create a shipment request on behalf of the customer
      const requestPayload = {
        customer_code: customerCode,
        package_ids: selectedPackages,
        channel,
        wrapping: "normal",
        payment_time: paymentTime,
        customer_note: shipmentNote.trim() || "Created by Admin",
        packaging: "Normal Standard Packaging",
        total_weight: Number(totalWeight),
        total_weight_unit: weightUnit || (channel === "sea" ? "cbm" : "kg"),
        admin_created_for_user_id: selectedUser.id
      }

      const reqRes = await fetch("/api/shipment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      })

      const reqResult = await reqRes.json()
      if (!reqRes.ok) {
        toast.error(reqResult.message || "Failed to create underlying request")
        return
      }

      const shipmentRequestId = reqResult.data?.id
      if (!shipmentRequestId) {
        toast.error("Failed to retrieve underlying request ID")
        return
      }

      // Step 2: Vet the shipment request directly in the backend
      const vetRes = await fetch(`/api/shipment-requests/${shipmentRequestId}/vet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" })
      })

      if (!vetRes.ok) {
        const vetResult = await vetRes.json()
        toast.error(vetResult.message || "Failed to vet request")
        return
      }

      // Step 3: Generate the Shipment
      const formData = new FormData()
      libraryMedia.forEach((item) => {
        formData.append("media_asset_ids", String(item.id))
      })
      formData.append("customer_code", customerCode)
      formData.append("origin_warehouse_id", originWarehouseId)
      formData.append("destination_warehouse_id", destinationWarehouseId)
      formData.append("channel", channel)
      formData.append("shipment_request_id", String(shipmentRequestId))
      formData.append("shipment_note", shipmentNote.trim())
      formData.append("user_id", String(selectedUser.id))
      formData.append("payment_time", paymentTime)
      formData.append("package_ids", selectedPackages.join(","))
      formData.append("total_weight", String(totalWeight))
      formData.append("total_weight_unit", weightUnit || (channel === "sea" ? "cbm" : "kg"))
      formData.append("total_price", String(totalPrice))

      const shipRes = await fetch("/api/shipments", {
        method: "POST",
        body: formData
      })

      const shipResult = await shipRes.json()
      if (!shipRes.ok) {
        toast.error(shipResult.message || "Failed to generate shipment")
        return
      }

      toast.success("Shipment successfully created")
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error("Network error during shipment creation")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="admin-modal__form">
      <div className="admin-modal__fields">
        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Customer</span>
          <DHEIRSelect
            value={customerCode}
            onChange={(e) => {
              setCustomerCode(e.target.value)
              setSelectedPackages([])
            }}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.code}>
                {c.first_name} {c.last_name} ({c.code})
              </option>
            ))}
          </DHEIRSelect>
        </label>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Shipping Channel</span>
          <DHEIRSelect
            value={channel}
            onChange={(e) => setChannel(e.target.value as any)}
            required
          >
            <option value="air_gz">Air Gz</option>
            <option value="air_hk">Air HK</option>
            <option value="sea">Sea</option>
            <option value="express">Express</option>
          </DHEIRSelect>
        </label>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Origin Warehouse</span>
          <DHEIRSelect
            value={originWarehouseId}
            onChange={(e) => setOriginWarehouseId(e.target.value)}
            required
          >
            <option value="">Select Origin</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.country})
              </option>
            ))}
          </DHEIRSelect>
        </label>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Destination Warehouse</span>
          <DHEIRSelect
            value={destinationWarehouseId}
            onChange={(e) => setDestinationWarehouseId(e.target.value)}
            required
          >
            <option value="">Select Destination</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.country})
              </option>
            ))}
          </DHEIRSelect>
        </label>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Total Price (₦)</span>
          <input
            type="number"
            className="dheir-input"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            min={0}
            step="0.01"
            required
          />
        </label>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">
            {weightUnit === "cbm" ? "Total Volume (CBM)" : "Total Weight (kg)"}
          </span>
          <input
            type="number"
            className="dheir-input"
            value={totalWeight}
            onChange={(e) => setTotalWeight(e.target.value)}
            min={0}
            step="0.01"
            required
          />
        </label>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Weight Unit</span>
          <DHEIRSelect
            value={weightUnit}
            onChange={(e) => setWeightUnit(e.target.value as any)}
            required
          >
            <option value="kg">KG</option>
            <option value="cbm">CBM</option>
          </DHEIRSelect>
        </label>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Payment Timing</span>
          <DHEIRSelect
            value={paymentTime}
            onChange={(e) => setPaymentTime(e.target.value as any)}
            required
          >
            <option value="pay_before_shipment">Pay before shipment</option>
            <option value="pay_after_shipment">Pay after shipment</option>
          </DHEIRSelect>
        </label>

        <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
          <span className="portal-packages__field-label">Select Packages</span>
          {customerCode ? (
            availablePackages.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
                {availablePackages.map((p) => {
                  const isChecked = selectedPackages.includes(p.id)
                  return (
                    <label
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        border: "1px solid var(--color-dheir-border)",
                        backgroundColor: isChecked ? "rgba(26, 95, 255, 0.05)" : "transparent",
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePackage(p.id)}
                        style={{ width: "auto" }}
                      />
                      <span style={{ fontSize: "14px" }}>
                        {p.package_name} ({p.incoming_package_id}) - {p.weight} {p.weight_unit}
                      </span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="admin-uploader__help" style={{ marginTop: "0.5rem" }}>
                No stored packages found for this customer code.
              </p>
            )
          ) : (
            <p className="admin-uploader__help" style={{ marginTop: "0.5rem" }}>
              Please select a customer first to load packages.
            </p>
          )}
        </div>

        <label className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
          <span className="portal-packages__field-label">Shipment Note / Instructions</span>
          <textarea
            className="dheir-input"
            value={shipmentNote}
            onChange={(e) => setShipmentNote(e.target.value)}
            rows={3}
            placeholder="Details about items, packaging etc."
            style={{ width: "100%", marginTop: 8 }}
          />
        </label>
      </div>

      <div className="admin-uploader" style={{ marginTop: "1rem" }}>
        <div className="admin-uploader__row">
          <div>
            <p className="portal-packages__field-label" style={{ margin: 0 }}>
              Images
            </p>
            <p className="admin-uploader__help">
              Choose photos or videos from the media library (required).
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="portal-home__btn portal-home__btn--secondary"
              disabled={submitting}
              onClick={() => setPickerOpen(true)}
            >
              <span className="inline-flex items-center gap-2">
                Choose from library <FaImage />
              </span>
            </button>
            <button
              type="button"
              className="portal-home__btn portal-home__btn--primary"
              disabled={submitting}
              onClick={() => setUploadOpen(true)}
            >
              Upload
            </button>
          </div>
        </div>

        {libraryMedia.length > 0 ? (
          <div className="admin-uploader__previews">
            {libraryMedia.map((item) => (
              <div key={item.id} className="admin-uploader__preview">
                {item.mediaType === "video" ? (
                  <video
                    src={item.publicUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className="object-cover"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  />
                ) : (
                  <Image src={item.publicUrl} alt="" fill className="object-cover" unoptimized />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-uploader__help">No media selected yet.</p>
        )}
      </div>

      <MediaPickerModal
        open={pickerOpen}
        maxCount={8}
        minCount={1}
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

      <div className="admin-modal__actions">
        <button
          type="button"
          className="portal-home__btn portal-home__btn--secondary"
          onClick={onClose}
          disabled={submitting}
        >
          Close
        </button>
        <button
          type="submit"
          className="portal-home__btn portal-home__btn--primary"
          disabled={submitting || !customerCode || selectedPackages.length === 0}
        >
          {submitting ? <DHEIRLoader color="#fff" size={10} /> : "Add Shipment"}
        </button>
      </div>
    </form>
  )
}
