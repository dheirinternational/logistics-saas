"use client"

import { useState, useEffect } from "react"
import { IconPlus, IconTrash, IconCalculator, IconAlertCircle, IconPhone, IconCheck } from "@tabler/icons-react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { LocalPhotoUploader } from "./LocalPhotoUploader"
import { toast } from "@/lib/ui/toast"
import Link from "next/link"

const PROCUREMENT_DRAFT_KEY = "dheir_procurement_draft"
const MAX_PROCUREMENT_LINKS = 5
const MIN_MOQ_PER_LINK = 10
const CUSTOMER_SERVICE_PHONE = "+234 816 727 8847"
const CUSTOMER_SERVICE_HREF = "tel:+2348167278847"

type ItemSpec = {
  id: string
  title: string
  url: string
  variant: string
  quantity: number | string
  priceRmb: number | string
  photos: string[]
  note: string
}

function parsePrice(val: any): number {
  if (val == null || val === "") return 0
  if (typeof val === "number") return isNaN(val) ? 0 : val
  const cleaned = String(val).replace(/[^0-9.-]/g, "")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export function PortalProcurementBuyForMe({ onSuccess }: { onSuccess: () => void }) {
  const [items, setItems] = useState<ItemSpec[]>([
    {
      id: "item-1",
      title: "",
      url: "",
      variant: "",
      quantity: 10,
      priceRmb: "",
      photos: [],
      note: "",
    },
  ])

  const [customerNote, setCustomerNote] = useState("")
  const [packagingInstruction, setPackagingInstruction] = useState("Standard export packaging")
  const [exchangeRate, setExchangeRate] = useState<number>(209)
  const [submitting, setSubmitting] = useState(false)
  const [rejectionError, setRejectionError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ reference: string } | null>(null)

  const commitmentFee = 20000

  // Restore local draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROCUREMENT_DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          setItems(parsed.items.slice(0, MAX_PROCUREMENT_LINKS))
        }
        if (parsed.customerNote) setCustomerNote(parsed.customerNote)
        if (parsed.packagingInstruction) setPackagingInstruction(parsed.packagingInstruction)
      }
    } catch {
      // Ignore storage read errors
    }
  }, [])

  // Auto-save draft on changes
  useEffect(() => {
    try {
      const draft = {
        items,
        customerNote,
        packagingInstruction,
      }
      localStorage.setItem(PROCUREMENT_DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // Ignore storage write errors
    }
  }, [items, customerNote, packagingInstruction])

  useEffect(() => {
    fetch("/api/money-exchange-rate")
      .then((r) => r.json())
      .then((result) => {
        if (Array.isArray(result.data)) {
          const rmbRate = result.data.find(
            (item: any) => item.name === "rmb_to_naira" || item.name === "yen_to_naira"
          )
          if (rmbRate?.currency_two) {
            setExchangeRate(Number(rmbRate.currency_two))
          }
        }
      })
      .catch(() => {})
  }, [])

  const addItem = () => {
    if (items.length >= MAX_PROCUREMENT_LINKS) {
      setRejectionError(
        "Our online procurement service currently accepts a maximum of 5 product links. For orders above 5 links, please contact Customer Service."
      )
      return
    }

    setRejectionError(null)
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        title: "",
        url: "",
        variant: "",
        quantity: 10,
        priceRmb: "",
        photos: [],
        note: "",
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setRejectionError(null)
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const updateItem = (index: number, field: keyof ItemSpec, val: any) => {
    setItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: val }
      return copy
    })
  }

  const totalRmb = items.reduce((acc, curr) => {
    const qty = parseInt(String(curr.quantity).replace(/[^0-9]/g, ""), 10) || 0
    const price = parsePrice(curr.priceRmb)
    return acc + price * qty
  }, 0)
  const totalNgnMerchandise = totalRmb * exchangeRate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRejectionError(null)

    // Flow Check 1: Max 5 links
    if (items.length > MAX_PROCUREMENT_LINKS) {
      setRejectionError(
        "Our online procurement service currently accepts a maximum of 5 product links. For orders above 5 links, please contact Customer Service."
      )
      return
    }

    const first = items[0]
    if (!first.title.trim() || !first.url.trim()) {
      toast.error("Please provide at least one product title and marketplace link")
      return
    }

    // Flow Check 2: Minimum quantity (MOQ) 10 pieces per link
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      const qty = parseInt(String(it.quantity).replace(/[^0-9]/g, ""), 10) || 0
      if (qty < MIN_MOQ_PER_LINK) {
        setRejectionError(
          "The minimum quantity for procurement is 10 pieces per product link. Please adjust the quantity or contact Customer Service."
        )
        return
      }
    }

    setSubmitting(true)
    try {
      const allImageUrls = items.flatMap((i) => i.photos).filter(Boolean)
      const variantSummary = items
        .map(
          (i, idx) =>
            `Item #${idx + 1}: ${i.title} (${i.variant || "Standard"}) x${
              parseInt(String(i.quantity).replace(/[^0-9]/g, ""), 10) || 10
            } @ ¥${parsePrice(i.priceRmb)} | Link: ${i.url}`
        )
        .join("\n")

      const totalQuantity = items.reduce(
        (acc, curr) => acc + (parseInt(String(curr.quantity).replace(/[^0-9]/g, ""), 10) || 10),
        0
      )

      const res = await fetch("/api/customer/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          request_type: "procurement",
          title: items.length === 1 ? first.title : `${first.title} (+${items.length - 1} more items)`,
          product_url: first.url.trim(),
          target_price_rmb: totalRmb,
          quantity: totalQuantity,
          variant_details: variantSummary,
          packaging_instruction: packagingInstruction,
          customer_note: customerNote,
          image_urls: allImageUrls,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        setRejectionError(json.message || "Failed to submit procurement request. Please contact Customer Service.")
        return
      }

      // Clear draft on successful submission
      try {
        localStorage.removeItem(PROCUREMENT_DRAFT_KEY)
      } catch {
        // Ignore
      }

      setSuccessData({ reference: json.data.reference_number })
    } catch (err) {
      console.error(err)
      toast.error("Network error while submitting request")
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
            Your procurement request has been successfully received.
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
      {/* Rate Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "14px 18px",
          borderRadius: "12px",
          backgroundColor: "var(--color-dheir-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconCalculator size={20} stroke={1.5} style={{ color: "var(--color-dheir-blue)" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>
            Today&apos;s Procurement Exchange Rate: 1 RMB = ₦{exchangeRate.toLocaleString()}
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)" }}>
          Max {MAX_PROCUREMENT_LINKS} links | Min {MIN_MOQ_PER_LINK} pcs per link | Commitment fee: ₦{commitmentFee.toLocaleString()}
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
              Need assistance or large volume order?
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

      {/* Items Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "var(--color-dheir-surface)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-dheir-ink)" }}>
                Product Link #{idx + 1} of {MAX_PROCUREMENT_LINKS}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#ef4444",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <IconTrash size={15} stroke={1.5} />
                  Remove Item
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Product Name / Title *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Kettle 1.8L"
                  className="dheir-input"
                  value={item.title}
                  onChange={(e) => {
                    updateItem(idx, "title", e.target.value)
                    if (rejectionError) setRejectionError(null)
                  }}
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">1688 / Taobao / Alibaba Link *</span>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    placeholder="https://detail.1688.com/offer/... or paste link"
                    className="dheir-input"
                    value={item.url}
                    onChange={(e) => {
                      updateItem(idx, "url", e.target.value)
                      if (rejectionError) setRejectionError(null)
                    }}
                  />
                </div>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Color / Size / Variant</span>
                <input
                  type="text"
                  placeholder="e.g. Matte Black, 220V EU plug"
                  className="dheir-input"
                  value={item.variant}
                  onChange={(e) => updateItem(idx, "variant", e.target.value)}
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Quantity (Min {MIN_MOQ_PER_LINK} pcs) *</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="10"
                  className="dheir-input"
                  value={item.quantity}
                  onChange={(e) => {
                    updateItem(idx, "quantity", e.target.value)
                    if (rejectionError) setRejectionError(null)
                  }}
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Price per unit (¥ RMB) *</span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  className="dheir-input"
                  value={item.priceRmb}
                  onChange={(e) => updateItem(idx, "priceRmb", e.target.value)}
                />
              </label>
            </div>

            <LocalPhotoUploader
              label="Mandatory Reference Photos (Zero Factory Mistakes)"
              helperText="Upload 1-3 photos of the exact color, size, and packaging variant"
              maxPhotos={3}
              value={item.photos}
              onChange={(urls) => updateItem(idx, "photos", urls)}
            />
          </div>
        ))}

        {items.length < MAX_PROCUREMENT_LINKS && (
          <button
            type="button"
            onClick={addItem}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              backgroundColor: "var(--color-dheir-surface)",
              color: "var(--color-dheir-blue)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <IconPlus size={16} stroke={1.5} />
            Add Another Product Link ({items.length}/{MAX_PROCUREMENT_LINKS})
          </button>
        )}
      </div>

      {/* Packaging & Customer Instructions */}
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "var(--color-dheir-surface)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Packaging Preference</span>
          <select
            className="dheir-input"
            value={packagingInstruction}
            onChange={(e) => setPackagingInstruction(e.target.value)}
          >
            <option value="Standard export packaging">Standard export carton packaging</option>
            <option value="Reinforced bubble film & waterproof tape">Reinforced bubble film & waterproof tape</option>
            <option value="Wooden frame / Crate protection for fragile items">Wooden frame / Crate protection</option>
            <option value="Remove shoe/retail boxes to minimize CBM">Remove retail boxes to minimize CBM volume</option>
          </select>
        </label>

        <label className="portal-packages__field">
          <span className="portal-packages__field-label">Instructions / Note for Chinese Buying Team</span>
          <textarea
            rows={2}
            className="dheir-input"
            placeholder="e.g. Ensure supplier packs all units together with spare parts..."
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </label>
      </div>

      {/* Summary Box */}
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "#f8fafc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Estimated Merchandise Total
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-dheir-ink)" }}>
              ¥{totalRmb.toFixed(2)} RMB
            </span>
            <span style={{ fontSize: "14px", color: "var(--color-dheir-blue)", fontWeight: 600 }}>
              (≈ ₦{totalNgnMerchandise.toLocaleString("en-NG", { maximumFractionDigits: 0 })})
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)", display: "block", marginTop: "2px" }}>
            * Final quotation will verify China domestic freight & factory availability.
          </span>
        </div>

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

