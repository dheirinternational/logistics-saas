"use client"

import {
  PortalFormField,
  PortalFormInput,
  PortalFormSelect,
  PortalFormTextarea,
} from "@/components/portal/packages/PortalFormField"
import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import type { Warehouse } from "@/types/entityTypeDef"
import { FormEvent, useEffect, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"

export default function AddPackagePage() {
  const [packageInformation, setPackageInformation] = useState({
    incoming_tracking_number: "",
    warehouse_id: 1,
    declared_item_name: "",
    declared_item_quantity: 1,
    customer_note: "",
    status: "expected",
  })
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/warehouses", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.length) {
          setWarehouses(data.data)
          setPackageInformation((prev) => ({
            ...prev,
            warehouse_id: data.data[0].id,
          }))
        }
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const tracking = packageInformation.incoming_tracking_number.trim()
    const itemName = packageInformation.declared_item_name.trim()

    // 1. Basic empty check
    if (!tracking || !itemName) {
      toast.error("Please fill in all required fields")
      return
    }

    // 2. Alert/error if tracking number contains spaces or is suspiciously formatted
    if (tracking.includes(" ")) {
      toast.error("Tracking number should not contain spaces. Check that you didn't paste an item name or address.")
      return
    }

    // 3. Check if tracking number is too short (usually tracking codes are at least 5 characters)
    if (tracking.length < 5) {
      toast.error("Tracking number is too short. Please double-check.")
      return
    }

    // 4. Check if tracking number contains no numeric digits at all (typical tracking numbers have numbers)
    const hasDigits = /\d/.test(tracking)
    if (!hasDigits) {
      toast.error(`"${tracking}" doesn't look like a tracking number. It has no digits. Please verify you didn't put the product name here by mistake.`)
      return
    }

    // 5. Check if tracking number looks exactly like common items/words (simple letters only)
    const onlyLetters = /^[a-zA-Z]+$/.test(tracking)
    if (onlyLetters) {
      toast.error(`"${tracking}" appears to be a description/word instead of a supplier tracking number.`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/incoming-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(packageInformation),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result?.message)
        return
      }
      toast.success(`Registered ${packageInformation.declared_item_name}`)
      setPackageInformation({
        incoming_tracking_number: "",
        warehouse_id: warehouses[0]?.id ?? 1,
        declared_item_name: "",
        declared_item_quantity: 1,
        customer_note: "",
        status: "expected",
      })
    } catch (err) {
      console.error(err)
      toast.error("Could not add package")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="portal-packages">
      <PortalPackagesPageHeader
        title="Add incoming package"
        description="Tell us what is on the way to our China warehouse so we can match it when it arrives."
        backHref="/customer/packages"
        backLabel="Packages"
      />

      <form onSubmit={handleSubmit} className="portal-packages__form">
        <div className="portal-packages__form-grid portal-packages__form-grid--split">
          <PortalFormField label="Warehouse" className="portal-packages__field--grow">
            <PortalFormSelect
              name="warehouse_id"
              required
              value={packageInformation.warehouse_id}
              onChange={(e) =>
                setPackageInformation((prev) => ({
                  ...prev,
                  warehouse_id: Number(e.target.value),
                }))
              }
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </PortalFormSelect>
          </PortalFormField>

          <PortalFormField label="Quantity" className="portal-packages__field--narrow">
            <PortalFormInput
              type="number"
              name="declared_item_quantity"
              min={1}
              required
              value={packageInformation.declared_item_quantity}
              onChange={(e) =>
                setPackageInformation((prev) => ({
                  ...prev,
                  declared_item_quantity: Number(e.target.value),
                }))
              }
            />
          </PortalFormField>
        </div>

        <PortalFormField label="Item name" hint="What did you order?">
          <PortalFormInput
            name="declared_item_name"
            required
            placeholder="e.g. Nike shoes, phone case"
            value={packageInformation.declared_item_name}
            onChange={(e) =>
              setPackageInformation((prev) => ({
                ...prev,
                declared_item_name: e.target.value,
              }))
            }
          />
        </PortalFormField>

        <PortalFormField
          label="Tracking number"
          hint="From your supplier or marketplace"
        >
          <PortalFormInput
            name="incoming_tracking_number"
            required
            placeholder="Courier tracking ID"
            value={packageInformation.incoming_tracking_number}
            onChange={(e) =>
              setPackageInformation((prev) => ({
                ...prev,
                incoming_tracking_number: e.target.value,
              }))
            }
          />
        </PortalFormField>

        <PortalFormField label="Note (optional)">
          <PortalFormTextarea
            name="customer_note"
            placeholder="Colour, size, or special instructions"
            value={packageInformation.customer_note}
            onChange={(e) =>
              setPackageInformation((prev) => ({
                ...prev,
                customer_note: e.target.value,
              }))
            }
          />
        </PortalFormField>

        <button
          type="submit"
          className="portal-packages__btn-primary portal-packages__btn-primary--block"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <DHEIRLoader color="#fff" size={8} />
          ) : (
            "Register package"
          )}
        </button>
      </form>
    </div>
  )
}
