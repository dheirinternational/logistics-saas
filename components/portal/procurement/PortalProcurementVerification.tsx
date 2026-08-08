"use client"

import { useState } from "react"
import { IconBuildingFactory2, IconChecklist, IconShieldCheck } from "@tabler/icons-react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"

export function PortalProcurementVerification({ onSuccess }: { onSuccess: () => void }) {
  const [supplierName, setSupplierName] = useState("")
  const [supplierAddress, setSupplierAddress] = useState("")
  const [supplierContact, setSupplierContact] = useState("")
  const [productDetails, setProductDetails] = useState("")
  const [verificationScope, setVerificationScope] = useState("Full Factory & Business License Audit")
  const [customerNote, setCustomerNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const consultationFee = 25000 // Factory on-site audit & verification fee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplierName.trim() || !supplierAddress.trim()) {
      toast.error("Please provide the Chinese supplier name and physical factory address")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/customer/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          request_type: "verification",
          title: `Verification: ${supplierName.trim()}`,
          supplier_name: supplierName.trim(),
          supplier_address: supplierAddress.trim(),
          supplier_contact: supplierContact.trim(),
          verification_scope: verificationScope,
          variant_details: productDetails.trim(),
          customer_note: customerNote.trim(),
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to submit verification request")
        return
      }

      toast.success("Verification request submitted! DHEIR China audit team will conduct the inspection.")
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error("Network error while submitting verification request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Notice Banner */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "12px",
          backgroundColor: "var(--color-dheir-surface)",
          border: "1px solid var(--color-dheir-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconShieldCheck size={20} stroke={1.5} style={{ color: "var(--color-dheir-blue)" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>
            Chinese Supplier & Factory Verification Audit
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)" }}>
          Audit & consultation fee: ₦{consultationFee.toLocaleString()} (Includes verification report & factory photos)
        </span>
      </div>

      {/* Form Details */}
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "var(--color-dheir-surface)",
          border: "1px solid var(--color-dheir-border)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Supplier / Company Chinese Name *</span>
            <input
              type="text"
              required
              placeholder="e.g. Foshan Shunde Furniture Co., Ltd (佛山市顺德区...)"
              className="dheir-input"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </label>

          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Supplier Contact Person & WeChat / Phone *</span>
            <input
              type="text"
              required
              placeholder="e.g. Mr. Chen (+86 138-0000-0000 / WeChat: chen_export)"
              className="dheir-input"
              value={supplierContact}
              onChange={(e) => setSupplierContact(e.target.value)}
            />
          </label>
        </div>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Physical Factory / Warehouse Address in China *</span>
          <textarea
            rows={2}
            required
            className="dheir-input"
            placeholder="e.g. No. 12 Industrial Road, Lecong Town, Shunde District, Foshan City, Guangdong Province, China"
            value={supplierAddress}
            onChange={(e) => setSupplierAddress(e.target.value)}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Audit Scope & Verification Tier</span>
            <select
              className="dheir-input"
              value={verificationScope}
              onChange={(e) => setVerificationScope(e.target.value)}
            >
              <option value="Full Factory & Business License Audit">Full On-Site Factory & Business License Audit</option>
              <option value="Product Quality & Sample Inspection">Product Quality & Pre-Shipment Sample Inspection</option>
              <option value="Supplier Background & Legal Registration Check">Supplier Background & Legal Registration Check</option>
              <option value="Production Capacity & Machinery Verification">Production Capacity & Machinery Verification</option>
            </select>
          </label>

          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Products You Intend to Buy from This Supplier</span>
            <input
              type="text"
              placeholder="e.g. Luxury Velvet Sofas, Ceramic Dining Tables"
              className="dheir-input"
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
            />
          </label>
        </div>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Specific Concerns / Questions for Our Audit Team</span>
          <textarea
            rows={3}
            className="dheir-input"
            placeholder="e.g. Please verify if they are the actual manufacturer or just a middleman trading company, and take video of their production line..."
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </label>
      </div>

      {/* Action footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="submit"
          disabled={submitting}
          className="portal-home__btn portal-home__btn--primary"
          style={{ padding: "12px 28px", fontSize: "14px" }}
        >
          {submitting ? <DHEIRLoader color="#ffffff" size={8} /> : "Submit Verification Audit Request"}
        </button>
      </div>
    </form>
  )
}
