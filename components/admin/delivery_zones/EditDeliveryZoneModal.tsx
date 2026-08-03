"use client"

import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"
import { IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"

export type DeliveryZoneRow = {
  id: number
  state_name: string
  price: number
}

type EditDeliveryZoneModalProps = {
  zone: DeliveryZoneRow
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export function EditDeliveryZoneModal({ zone, onClose, onSaved }: EditDeliveryZoneModalProps) {
  const [price, setPrice] = useState(String(zone.price))
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setPrice(String(zone.price))
  }, [zone.id, zone.price])

  const handleSave = async () => {
    const numericPrice = price === "" ? NaN : Number(price)
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      toast.error("Enter a valid delivery fee")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/delivery-zones/${zone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ price: numericPrice }),
      })

      const text = await res.text()
      let result: { message?: string } = {}
      if (text) {
        try {
          result = JSON.parse(text)
        } catch {
          result = {}
        }
      }

      if (!res.ok) {
        toast.error(result.message || "Could not update delivery fee")
        return
      }

      toast.success(result.message || "Delivery fee updated")
      await onSaved()
      onClose()
    } catch (err) {
      console.error("Update delivery zone error:", err)
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="delivery-zone-edit-modal__backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose()
      }}
    >
      <div
        className="delivery-zone-edit-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-zone-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="delivery-zone-edit-modal__head">
          <div>
            <p className="delivery-zone-edit-modal__eyebrow">Delivery zone</p>
            <h2 id="delivery-zone-edit-title" className="delivery-zone-edit-modal__title">
              {zone.state_name}
            </h2>
            <p className="delivery-zone-edit-modal__sub">
              Set the delivery fee customers pay for this state.
            </p>
          </div>
          <button
            type="button"
            className="delivery-zone-edit-modal__close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            <IconX size={20} stroke={1.5} aria-hidden />
          </button>
        </header>

        <div className="delivery-zone-edit-modal__body">
          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Delivery fee (₦)</span>
            <input
              type="number"
              className="dheir-input"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/^0+(?=\d)/, ""))}
              disabled={isSaving}
              autoFocus
            />
          </label>
        </div>

        <footer className="delivery-zone-edit-modal__foot">
          <button
            type="button"
            className="portal-home__btn portal-home__btn--secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="portal-home__btn portal-home__btn--primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <DHEIRLoader color="#fff" size={10} /> : "Save changes"}
          </button>
        </footer>
      </div>
    </div>
  )
}
