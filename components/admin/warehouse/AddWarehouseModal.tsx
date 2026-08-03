"use client"

import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { DHEIRSelect } from "@/components/ui/DHEIRSelect"
import { toast } from "@/lib/ui/toast"
import { IconX } from "@tabler/icons-react"
import { FormEvent, useState } from "react"

export type AddWarehouseFormValues = {
  name: string
  recipient_name: string
  phone: string
  country: "NG" | "CN"
  province: string
  city: string
  district: string
  street: string
  building: string
  postal_code: string
  type: "air" | "sea"
}

const INITIAL_VALUES: AddWarehouseFormValues = {
  name: "",
  recipient_name: "",
  phone: "",
  country: "NG",
  province: "",
  city: "",
  district: "",
  street: "",
  building: "",
  postal_code: "",
  type: "air",
}

type AddWarehouseModalProps = {
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export function AddWarehouseModal({ onClose, onSaved }: AddWarehouseModalProps) {
  const [values, setValues] = useState<AddWarehouseFormValues>(INITIAL_VALUES)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!values.name.trim() || !values.recipient_name.trim() || !values.phone.trim()) {
      toast.error("Name, recipient, and phone are required")
      return
    }
    if (!values.city.trim() || !values.street.trim() || !values.postal_code.trim()) {
      toast.error("City, street, and postal code are required")
      return
    }
    if (values.country === "CN" && (!values.province.trim() || !values.district.trim())) {
      toast.error("Province and district are required for China warehouses")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          name: values.name.trim(),
          recipient_name: values.recipient_name.trim(),
          phone: values.phone.trim(),
          province: values.province.trim(),
          city: values.city.trim(),
          district: values.district.trim(),
          street: values.street.trim(),
          building: values.building.trim(),
          postal_code: values.postal_code.trim(),
        }),
      })

      const text = await res.text()
      let result: { message?: string; error?: string } = {}
      if (text) {
        try {
          result = JSON.parse(text)
        } catch {
          result = {}
        }
      }

      if (!res.ok) {
        toast.error(result.message || result.error || "Could not add warehouse")
        return
      }

      toast.success("Warehouse added")
      await onSaved()
      onClose()
    } catch (err) {
      console.error("Add warehouse error:", err)
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="warehouse-add-modal__backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose()
      }}
    >
      <div
        className="warehouse-add-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="warehouse-add-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="warehouse-add-modal__head">
          <div>
            <p className="warehouse-add-modal__eyebrow">Warehouses</p>
            <h2 id="warehouse-add-title" className="warehouse-add-modal__title">
              Add warehouse
            </h2>
            <p className="warehouse-add-modal__sub">
              Create a new warehouse location for packages and shipments.
            </p>
          </div>
          <button
            type="button"
            className="warehouse-add-modal__close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            <IconX size={20} stroke={1.5} aria-hidden />
          </button>
        </header>

        <form className="warehouse-add-modal__form" onSubmit={handleSubmit}>
          <div className="warehouse-add-modal__fields">
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Warehouse name</span>
              <input
                type="text"
                name="name"
                className="dheir-input"
                value={values.name}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Type</span>
              <DHEIRSelect
                name="type"
                value={values.type}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, type: e.target.value as "air" | "sea" }))
                }
                required
                disabled={isSaving}
              >
                <option value="air">Air</option>
                <option value="sea">Sea</option>
              </DHEIRSelect>
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Recipient name</span>
              <input
                type="text"
                name="recipient_name"
                className="dheir-input"
                value={values.recipient_name}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Phone</span>
              <input
                type="tel"
                name="phone"
                className="dheir-input"
                value={values.phone}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Country</span>
              <DHEIRSelect
                name="country"
                value={values.country}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    country: e.target.value as "NG" | "CN",
                  }))
                }
                required
                disabled={isSaving}
              >
                <option value="NG">Nigeria</option>
                <option value="CN">China</option>
              </DHEIRSelect>
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Province / state</span>
              <input
                type="text"
                name="province"
                className="dheir-input"
                value={values.province}
                onChange={handleChange}
                disabled={isSaving}
              />
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">City</span>
              <input
                type="text"
                name="city"
                className="dheir-input"
                value={values.city}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">District</span>
              <input
                type="text"
                name="district"
                className="dheir-input"
                value={values.district}
                onChange={handleChange}
                disabled={isSaving}
                placeholder={values.country === "CN" ? "Required for China" : "Optional"}
              />
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Street</span>
              <input
                type="text"
                name="street"
                className="dheir-input"
                value={values.street}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Building</span>
              <input
                type="text"
                name="building"
                className="dheir-input"
                value={values.building}
                onChange={handleChange}
                disabled={isSaving}
              />
            </label>

            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Postal code</span>
              <input
                type="text"
                name="postal_code"
                className="dheir-input"
                value={values.postal_code}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </label>
          </div>

          <footer className="warehouse-add-modal__foot">
            <button
              type="button"
              className="portal-home__btn portal-home__btn--secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="portal-home__btn portal-home__btn--primary"
              disabled={isSaving}
            >
              {isSaving ? <DHEIRLoader color="#fff" size={10} /> : "Add warehouse"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
