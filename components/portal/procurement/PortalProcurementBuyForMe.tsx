"use client"

import { useState, useEffect } from "react"
import { IconLink, IconPlus, IconTrash, IconCalculator, IconInfoCircle } from "@tabler/icons-react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { LocalPhotoUploader } from "./LocalPhotoUploader"
import { toast } from "@/lib/ui/toast"

type ItemSpec = {
  id: string
  title: string
  url: string
  variant: string
  quantity: number
  priceRmb: number
  photos: string[]
  note: string
}

export function PortalProcurementBuyForMe({ onSuccess }: { onSuccess: () => void }) {
  const [items, setItems] = useState<ItemSpec[]>([
    {
      id: "item-1",
      title: "",
      url: "",
      variant: "",
      quantity: 1,
      priceRmb: 0,
      photos: [],
      note: "",
    },
  ])

  const [customerNote, setCustomerNote] = useState("")
  const [packagingInstruction, setPackagingInstruction] = useState("Standard export packaging")
  const [exchangeRate, setExchangeRate] = useState<number>(230) // RMB to NGN default
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/money-exchange-rate")
      .then((r) => r.json())
      .then((result) => {
        if (result.data && result.data[0]?.currency_two) {
          setExchangeRate(Number(result.data[0].currency_two))
        }
      })
      .catch(() => {})
  }, [])

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        title: "",
        url: "",
        variant: "",
        quantity: 1,
        priceRmb: 0,
        photos: [],
        note: "",
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const updateItem = (index: number, field: keyof ItemSpec, val: any) => {
    setItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: val }
      return copy
    })
  }

  const totalRmb = items.reduce((acc, curr) => acc + (Number(curr.priceRmb) || 0) * (Number(curr.quantity) || 1), 0)
  const totalNgnMerchandise = totalRmb * exchangeRate
  const commitmentFee = 5000 // NGN non-refundable commitment fee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const first = items[0]
    if (!first.title.trim() || !first.url.trim()) {
      toast.error("Please provide at least one product title and marketplace link")
      return
    }

    setSubmitting(true)
    try {
      const allImageUrls = items.flatMap((i) => i.photos).filter(Boolean)
      const variantSummary = items
        .map((i, idx) => `Item #${idx + 1}: ${i.title} (${i.variant || "Standard"}) x${i.quantity} @ ¥${i.priceRmb}`)
        .join("\n")

      const res = await fetch("/api/customer/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          request_type: "procurement",
          title: items.length === 1 ? first.title : `${first.title} (+${items.length - 1} more items)`,
          product_url: first.url,
          target_price_rmb: totalRmb,
          quantity: items.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0),
          variant_details: variantSummary,
          packaging_instruction: packagingInstruction,
          customer_note: customerNote,
          image_urls: allImageUrls,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to submit procurement request")
        return
      }

      toast.success("Procurement request submitted successfully!")
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error("Network error while submitting request")
    } finally {
      setSubmitting(false)
    }
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
          border: "1px solid var(--color-dheir-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconCalculator size={20} stroke={1.5} style={{ color: "var(--color-dheir-blue)" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>
            Today's Procurement Exchange Rate: 1 RMB = ₦{exchangeRate.toLocaleString()}
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)" }}>
          Commitment fee: ₦{commitmentFee.toLocaleString()} (Non-refundable within 72h)
        </span>
      </div>

      {/* Items Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "var(--color-dheir-surface)",
              border: "1px solid var(--color-dheir-border)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-dheir-ink)" }}>
                Item #{idx + 1}
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
                  onChange={(e) => updateItem(idx, "title", e.target.value)}
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">1688 / Taobao / Alibaba Link *</span>
                <div style={{ position: "relative" }}>
                  <input
                    type="url"
                    required
                    placeholder="https://detail.1688.com/offer/..."
                    className="dheir-input"
                    value={item.url}
                    onChange={(e) => updateItem(idx, "url", e.target.value)}
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
                <span className="portal-packages__field-label">Quantity *</span>
                <input
                  type="number"
                  min={1}
                  required
                  className="dheir-input"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Price per unit (¥ RMB) *</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  placeholder="0.00"
                  className="dheir-input"
                  value={item.priceRmb || ""}
                  onChange={(e) => updateItem(idx, "priceRmb", parseFloat(e.target.value) || 0)}
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

        <button
          type="button"
          onClick={addItem}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px dashed var(--color-dheir-border)",
            backgroundColor: "transparent",
            color: "var(--color-dheir-blue)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <IconPlus size={16} stroke={1.5} />
          Add Another Product Link
        </button>
      </div>

      {/* Packaging & Customer Instructions */}
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "var(--color-dheir-surface)",
          border: "1px solid var(--color-dheir-border)",
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
            placeholder="e.g. Ensure supplier packs all 100 units together with spare parts..."
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
          border: "1px solid var(--color-dheir-border)",
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
          {submitting ? <DHEIRLoader color="#ffffff" size={8} /> : "Submit Procurement Request"}
        </button>
      </div>
    </form>
  )
}
