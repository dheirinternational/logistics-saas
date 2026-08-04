"use client"

import { FormEvent, useEffect, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { DHEIRSelect } from "@/components/ui/DHEIRSelect"
import { toast } from "@/lib/ui/toast"

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
type CreateShipmentRequestModalProps = {
  onClose: () => void
  onSuccess: () => void
  preloadedCustomers?: Customer[]
  preloadedPackages?: StoredPackage[]
}

export default function CreateShipmentRequestModal({
  onClose,
  onSuccess,
  preloadedCustomers,
  preloadedPackages,
}: CreateShipmentRequestModalProps) {
  const [customers, setCustomers] = useState<Customer[]>(preloadedCustomers || [])
  const [packages, setPackages] = useState<StoredPackage[]>(preloadedPackages || [])
  const [loading, setLoading] = useState(!preloadedCustomers || !preloadedPackages)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [customerCode, setCustomerCode] = useState("")
  const [selectedPackages, setSelectedPackages] = useState<number[]>([])
  const [channel, setChannel] = useState<"air_gz" | "air_hk" | "sea" | "express">("air_gz")
  const [packaging, setPackaging] = useState("Normal Standard Packaging")
  const [paymentTime, setPaymentTime] = useState<"pay_before_shipment" | "pay_after_shipment">("pay_before_shipment")
  const [customerNote, setCustomerNote] = useState("")

  useEffect(() => {
    if (preloadedCustomers && preloadedPackages) {
      setCustomers(preloadedCustomers)
      setPackages(preloadedPackages)
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        const [usersRes, pkgsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/packages")
        ])
        const usersData = await usersRes.json()
        const pkgsData = await pkgsRes.json()

        if (usersData.success) setCustomers(usersData.data || [])
        if (pkgsData.success) setPackages(pkgsData.data || [])
      } catch (err) {
        console.error("Error loading data", err)
        toast.error("Failed to load users or packages")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [preloadedCustomers, preloadedPackages])

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

    setSubmitting(true)
    try {
      const selectedUser = customers.find((c) => c.code === customerCode)
      
      const payload = {
        customer_code: customerCode,
        package_ids: selectedPackages,
        channel,
        wrapping: "normal", // default matching schema requirements
        payment_time: paymentTime,
        customer_note: customerNote.trim() || "Created by Admin",
        packaging,
        total_weight: availablePackages
          .filter((p) => selectedPackages.includes(p.id))
          .reduce((sum, p) => sum + Number(p.weight || 0), 0),
        total_weight_unit: channel === "sea" ? "cbm" : "kg"
      }

      // We need to fetch/create shipment request on behalf of the customer's user_id.
      // Since POST /api/shipment-requests uses the session's user_id, let's create a custom endpoint
      // or post to the standard API if we simulate the customer context. Wait!
      // The POST /api/shipment-requests endpoint gets user_id from getSession().
      // If an admin is logged in, session.user_id is the Admin's ID.
      // But a shipment request needs u.id matching the customer's user_id.
      // Let's check app/api/shipment-requests/route.ts:
      // "const {user_id} = session; ... INSERT INTO shipment_requests (user_id...) VALUES ($1...)"
      // This means we should support setting user_id explicitly in the body for admins!
      // Let's modify app/api/shipment-requests/route.ts to allow user_id in body if user is admin.
      
      const res = await fetch("/api/shipment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          admin_created_for_user_id: selectedUser?.id // We'll pass this so the API can assign it correctly!
        })
      })

      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message || "Failed to create shipment request")
        return
      }

      toast.success("Shipment request successfully created")
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error("Network error")
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
          <span className="portal-packages__field-label">Packaging Type</span>
          <DHEIRSelect
            value={packaging}
            onChange={(e) => setPackaging(e.target.value)}
            required
          >
            <option value="Normal Standard Packaging">Normal Standard Packaging</option>
            <option value="Easy Packaging Paper">Easy Packaging Paper</option>
            <option value="Vacuum Service">Vacuum Service</option>
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
          <span className="portal-packages__field-label">Customer Note / Admin Instructions</span>
          <textarea
            className="dheir-input"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            rows={3}
            placeholder="Any extra packaging instructions..."
            style={{ width: "100%", marginTop: 8 }}
          />
        </label>
      </div>

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
          {submitting ? <DHEIRLoader color="#fff" size={10} /> : "Add Request"}
        </button>
      </div>
    </form>
  )
}
