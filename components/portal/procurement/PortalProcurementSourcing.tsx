"use client"

import { useState, useEffect } from "react"
import { IconSearch, IconAlertCircle, IconPhone, IconCheck } from "@tabler/icons-react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { LocalPhotoUploader } from "./LocalPhotoUploader"
import { toast } from "@/lib/ui/toast"
import Link from "next/link"

const SOURCING_DRAFT_KEY = "dheir_sourcing_draft"
const MIN_SOURCING_BUDGET_NGN = 500000
const CUSTOMER_SERVICE_PHONE = "+234 816 727 8847"
const CUSTOMER_SERVICE_HREF = "tel:+2348167278847"

function parsePrice(val: any): number | null {
  if (val == null || val === "") return null
  if (typeof val === "number") return isNaN(val) ? null : val
  const cleaned = String(val).replace(/[^0-9.-]/g, "")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

export function PortalProcurementSourcing({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("")
  const [qualityGrade, setQualityGrade] = useState("Premium Grade A")
  const [quantity, setQuantity] = useState<string | number>(10)
  const [targetBudget, setTargetBudget] = useState("")
  const [budgetCurrency, setBudgetCurrency] = useState("NGN")
  const [variantDetails, setVariantDetails] = useState("")
  const [customerNote, setCustomerNote] = useState("")
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [rejectionError, setRejectionError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ reference: string } | null>(null)

  const commitmentFee = 20000 // Sourcing & negotiation fee

  // Restore local draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SOURCING_DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.title) setTitle(parsed.title)
        if (parsed.qualityGrade) setQualityGrade(parsed.qualityGrade)
        if (parsed.quantity) setQuantity(parsed.quantity)
        if (parsed.targetBudget) setTargetBudget(parsed.targetBudget)
        if (parsed.budgetCurrency) setBudgetCurrency(parsed.budgetCurrency)
        if (parsed.variantDetails) setVariantDetails(parsed.variantDetails)
        if (parsed.customerNote) setCustomerNote(parsed.customerNote)
        if (Array.isArray(parsed.photoUrls)) setPhotoUrls(parsed.photoUrls)
      }
    } catch {
      // Ignore storage read errors
    }
  }, [])

  // Auto-save draft on changes
  useEffect(() => {
    try {
      const draft = {
        title,
        qualityGrade,
        quantity,
        targetBudget,
        budgetCurrency,
        variantDetails,
        customerNote,
        photoUrls,
      }
      localStorage.setItem(SOURCING_DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // Ignore storage write errors
    }
  }, [title, qualityGrade, quantity, targetBudget, budgetCurrency, variantDetails, customerNote, photoUrls])

  const calculateBudgetInNgn = (budget: number | null, currency: string): number => {
    if (!budget || budget <= 0) return 0
    if (currency === "USD") return budget * 1500
    if (currency === "RMB") return budget * 210
    return budget
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRejectionError(null)

    if (!title.trim()) {
      toast.error("Please describe what product you want us to source")
      return
    }

    const parsedBudget = parsePrice(targetBudget)
    const effectiveBudgetNgn = calculateBudgetInNgn(parsedBudget, budgetCurrency)

    // Flow Requirement: Check minimum sourcing order amount (N500,000)
    if (!parsedBudget || effectiveBudgetNgn < MIN_SOURCING_BUDGET_NGN) {
      setRejectionError(
        "Our minimum sourcing order is ₦500,000. Please adjust your order or contact Customer Service for assistance."
      )
      return
    }

    setSubmitting(true)
    try {
      const validPhotos = photoUrls.filter((url) => url.trim().length > 0)
      const parsedQty = parseInt(String(quantity).replace(/[^0-9]/g, ""), 10) || 1

      const res = await fetch("/api/customer/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          request_type: "sourcing",
          title: title.trim(),
          quality_grade: qualityGrade,
          quantity: parsedQty,
          target_budget: parsedBudget,
          budget_currency: budgetCurrency,
          variant_details: variantDetails,
          customer_note: customerNote,
          image_urls: validPhotos,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        setRejectionError(json.message || "Failed to submit sourcing request. Please contact Customer Service.")
        return
      }

      // Clear draft on successful submission
      try {
        localStorage.removeItem(SOURCING_DRAFT_KEY)
      } catch {
        // Ignore
      }

      setSuccessData({ reference: json.data.reference_number })
    } catch (err) {
      console.error(err)
      toast.error("Network error while submitting sourcing request")
    } finally {
      setSubmitting(false)
    }
  }

  // Confirmation View After Submission
  if (successData) {
    return (
      <div
        style={{
          padding: "32px 24px",
          borderRadius: "16px",
          backgroundColor: "var(--color-dheir-surface)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#dcfce7",
            color: "#15803d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconCheck size={28} stroke={2.5} />
        </div>

        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-dheir-ink)", margin: 0 }}>
            Your sourcing request has been successfully received.
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-dheir-muted)", margin: "8px 0 0" }}>
            Request submitted successfully. Our team will review your request and contact you with the next steps.
          </p>
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            backgroundColor: "#f8fafc",
            width: "100%",
            maxWidth: "420px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "var(--color-dheir-muted)" }}>Reference Number:</span>
            <span style={{ fontWeight: 700, color: "var(--color-dheir-ink)" }}>{successData.reference}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "var(--color-dheir-muted)" }}>Commitment Fee:</span>
            <span style={{ fontWeight: 700, color: "var(--color-dheir-blue)" }}>₦{commitmentFee.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
          <Link
            href={`/customer/payments/transfer/procurement/${encodeURIComponent(successData.reference)}`}
            className="portal-home__btn portal-home__btn--primary"
            style={{ padding: "12px 24px", fontSize: "14px", textDecoration: "none" }}
          >
            Proceed to Payment
          </Link>
          <button
            type="button"
            onClick={onSuccess}
            className="portal-home__btn portal-home__btn--secondary"
            style={{ padding: "12px 24px", fontSize: "14px" }}
          >
            View in My Requests
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Notice Banner */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "12px",
          backgroundColor: "var(--color-dheir-surface)",
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
          Minimum sourcing order: ₦500,000 | Commitment fee: ₦{commitmentFee.toLocaleString()}
        </span>
      </div>

      {/* Rejection Alert Card with Customer Service Contact */}
      {rejectionError && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            backgroundColor: "#fef2f2",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <IconAlertCircle size={20} stroke={2} style={{ color: "#dc2626", marginTop: "2px", flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#991b1b", display: "block" }}>
                Request Cannot Proceed
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#b91c1c", lineHeight: 1.45 }}>
                {rejectionError}
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#7f1d1d", fontWeight: 500 }}>
              Need help or custom quotation?
            </span>
            <a
              href={CUSTOMER_SERVICE_HREF}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <IconPhone size={14} stroke={2} />
              Contact Customer Service ({CUSTOMER_SERVICE_PHONE})
            </a>
          </div>
        </div>
      )}

      {/* Main Sourcing Form */}
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "var(--color-dheir-surface)",
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
            onChange={(e) => {
              setTitle(e.target.value)
              if (rejectionError) setRejectionError(null)
            }}
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
              type="text"
              inputMode="numeric"
              required
              className="dheir-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>

          <label className="portal-packages__field">
            <span className="portal-packages__field-label">Target Order Budget (Min ₦500,000) *</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="500,000"
                className="dheir-input"
                value={targetBudget}
                onChange={(e) => {
                  setTargetBudget(e.target.value)
                  if (rejectionError) setRejectionError(null)
                }}
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
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)" }}>
          Your draft is safely saved automatically on this device.
        </span>
        <button
          type="submit"
          disabled={submitting}
          className="portal-home__btn portal-home__btn--primary"
          style={{ padding: "12px 28px", fontSize: "14px" }}
        >
          {submitting ? <DHEIRLoader color="#ffffff" size={8} /> : "Proceed to Payment"}
        </button>
      </div>
    </form>
  )
}

