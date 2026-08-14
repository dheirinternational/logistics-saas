"use client"

import { useState } from "react"
import { IconSearch } from "@tabler/icons-react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { LocalPhotoUploader } from "./LocalPhotoUploader"
import { toast } from "@/lib/ui/toast"

export function PortalProcurementSourcing({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("")
  const [qualityGrade, setQualityGrade] = useState("Premium Grade A")
  const [quantity, setQuantity] = useState(10)
  const [targetBudget, setTargetBudget] = useState("")
  const [budgetCurrency, setBudgetCurrency] = useState("NGN")
  const [variantDetails, setVariantDetails] = useState("")
  const [customerNote, setCustomerNote] = useState("")
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const commitmentFee = 20000 // Sourcing & negotiation fee

  const updatePhotoUrl = (index: number, val: string) => {
    setPhotoUrls((prev) => {
      const copy = [...prev]
      copy[index] = val
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Please describe what product you want us to source")
      return
    }

    setSubmitting(true)
    try {
      const validPhotos = photoUrls.filter((url) => url.trim().length > 0)

      const res = await fetch("/api/customer/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          request_type: "sourcing",
          title: title.trim(),
          quality_grade: qualityGrade,
          quantity: Number(quantity) || 1,
          target_budget: Number(targetBudget) || null,
          budget_currency: budgetCurrency,
          variant_details: variantDetails,
          customer_note: customerNote,
          image_urls: validPhotos,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to submit sourcing request")
        return
      }

      toast.success("Sourcing request submitted! Our Guangzhou team will begin finding suppliers.")
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error("Network error while submitting sourcing request")
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
          <IconSearch size={20} stroke={1.5} style={{ color: "var(--color-dheir-blue)" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>
            Factory Sourcing & Price Negotiation Service
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)" }}>
          Sourcing commitment fee: ₦{commitmentFee.toLocaleString()} (Includes supplier quotation & MOQ matching)
        </span>
      </div>

      {/* Main Sourcing Form */}
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
        <label className="portal-packages__field">
          <span className="portal-packages__field-label">What product do you want us to source? *</span>
          <input
            type="text"
            required
            placeholder="e.g. Ergonomic Office Chairs with Lumbar Support"
            className="dheir-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Quality Grade / Material Standard</span>
            <select
              className="dheir-input"
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value)}
            >
              <option value="Premium Grade A">Premium Grade A (Highest standard)</option>
              <option value="Standard Commercial Grade">Standard Commercial Grade (Popular market)</option>
              <option value="Budget / High Economy">Budget / High Economy (Lowest factory price)</option>
              <option value="OEM Custom Branded">OEM Custom Branded (With my logo & box)</option>
            </select>
          </label>

          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Target Quantity *</span>
            <input
              type="number"
              min={1}
              required
              className="dheir-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </label>

          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Target Budget (Per unit or Total)</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                min={0}
                placeholder="50,000"
                className="dheir-input"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
              />
              <select
                className="dheir-input"
                style={{ maxWidth: "100px" }}
                value={budgetCurrency}
                onChange={(e) => setBudgetCurrency(e.target.value)}
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="RMB">RMB (¥)</option>
              </select>
            </div>
          </label>
        </div>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Color, Sizes, and Technical Specifications</span>
          <textarea
            rows={3}
            className="dheir-input"
            placeholder="e.g. Dimensions: 120cm x 60cm, Mesh back, Steel base. Need 50 units in Black and 50 units in Grey..."
            value={variantDetails}
            onChange={(e) => setVariantDetails(e.target.value)}
          />
        </label>

        <LocalPhotoUploader
          label="Sample & Reference Photos (At least 2-3 photos)"
          helperText="Upload sample photos of the item, labels, or target materials from your phone/device"
          maxPhotos={4}
          value={photoUrls}
          onChange={setPhotoUrls}
        />

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Additional Sourcing Instructions</span>
          <textarea
            rows={2}
            className="dheir-input"
            placeholder="e.g. Please check if supplier can provide CE certification or video demonstration..."
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
          {submitting ? <DHEIRLoader color="#ffffff" size={8} /> : "Submit Sourcing Request"}
        </button>
      </div>
    </form>
  )
}
