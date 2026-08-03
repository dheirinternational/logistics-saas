"use client"

import type { QuoteChannel, QuoteItemCart } from "@/lib/portal/quote/types"
import { formatGoodLabel } from "@/lib/portal/quote/format"
import {
  PortalFormField,
  PortalFormInput,
} from "@/components/portal/packages/PortalFormField"
import type {
  AirPricingTemplate,
  ExpressPricingTemplate,
  SeaPricingTemplate,
} from "@/types/entityTypeDef"
import { useEffect, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"

type AddToCart = (value: QuoteItemCart) => void

function TemplateChips<T extends { name: string }>({
  items,
  selected,
  onSelect,
}: {
  items: T[]
  selected: T | null
  onSelect: (item: T) => void
}) {
  return (
    <div className="portal-quote__chips">
      {items.map((type) => (
        <button
          key={type.name}
          type="button"
          className={`portal-quote__chip${selected?.name === type.name ? " is-active" : ""}`}
          onClick={() => onSelect(type)}
        >
          {formatGoodLabel(type.name)}
        </button>
      ))}
    </div>
  )
}

export function PortalQuoteAirForm({ addToCart }: { addToCart: AddToCart }) {
  const [templates, setTemplates] = useState<AirPricingTemplate[]>([])
  const [selected, setSelected] = useState<AirPricingTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [weight, setWeight] = useState(1)
  const [numberOfItems, setNumberOfItems] = useState(1)
  const weightUnit = selected?.rate_unit === "cbm" ? "cbm" : "kg"

  useEffect(() => {
    fetch("/api/pricing_template/air")
      .then((r) => r.json())
      .then((result) => {
        if (!result.data) return
        setTemplates(result.data)
        setSelected(result.data[0] ?? null)
      })
      .catch(() => toast.error("Could not load air rates"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="portal-quote__form-loading">
        <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
      </div>
    )
  }

  return (
    <div className="portal-quote__form">
      <TemplateChips items={templates} selected={selected} onSelect={setSelected} />
      <div className="portal-quote__form-grid">
        <PortalFormField label={weightUnit === "kg" ? "Weight (kg)" : "Volume (CBM)"}>
          <PortalFormInput
            type="number"
            min={0.1}
            step={0.1}
            value={weight || ""}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </PortalFormField>
        <PortalFormField label="Quantity">
          <PortalFormInput
            type="number"
            min={1}
            value={numberOfItems}
            onChange={(e) => setNumberOfItems(Number(e.target.value))}
          />
        </PortalFormField>
      </div>
      <button
        type="button"
        className="portal-quote__btn-primary portal-quote__btn-primary--block"
        onClick={() =>
          addToCart({
            id: Date.now(),
            name: selected?.name ?? "",
            weight,
            unit: weightUnit,
            numberOfItems,
          })
        }
      >
        Add to quote
      </button>
    </div>
  )
}

export function PortalQuoteSeaForm({ addToCart }: { addToCart: AddToCart }) {
  const [templates, setTemplates] = useState<SeaPricingTemplate[]>([])
  const [selected, setSelected] = useState<SeaPricingTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [measure, setMeasure] = useState(0.1)
  const [numberOfItems, setNumberOfItems] = useState(1)
  const seaUnit = selected?.rate_unit === "kg" ? "kg" : "cbm"

  useEffect(() => {
    fetch("/api/pricing_template/sea")
      .then((r) => r.json())
      .then((result) => {
        if (!result.data) return
        setTemplates(result.data)
        setSelected(result.data[0] ?? null)
      })
      .catch(() => toast.error("Could not load sea rates"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="portal-quote__form-loading">
        <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
      </div>
    )
  }

  return (
    <div className="portal-quote__form">
      <TemplateChips items={templates} selected={selected} onSelect={setSelected} />
      <div className="portal-quote__form-grid">
        <PortalFormField label={seaUnit === "kg" ? "Weight (kg)" : "Volume (CBM)"}>
          <PortalFormInput
            type="number"
            min={0.1}
            step={0.1}
            value={measure || ""}
            onChange={(e) => setMeasure(Number(e.target.value))}
          />
        </PortalFormField>
        <PortalFormField label="Quantity">
          <PortalFormInput
            type="number"
            min={1}
            value={numberOfItems}
            onChange={(e) => setNumberOfItems(Number(e.target.value))}
          />
        </PortalFormField>
      </div>
      <button
        type="button"
        className="portal-quote__btn-primary portal-quote__btn-primary--block"
        onClick={() =>
          addToCart({
            id: Date.now(),
            name: selected?.name ?? "",
            weight: measure,
            unit: seaUnit,
            numberOfItems,
          })
        }
      >
        Add to quote
      </button>
    </div>
  )
}

export function PortalQuoteExpressForm({ addToCart }: { addToCart: AddToCart }) {
  const [templates, setTemplates] = useState<ExpressPricingTemplate[]>([])
  const [selected, setSelected] = useState<ExpressPricingTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [numberOfItems, setNumberOfItems] = useState(1)

  useEffect(() => {
    fetch("/api/pricing_template/express")
      .then((r) => r.json())
      .then((result) => {
        if (!result.data) return
        setTemplates(result.data)
        setSelected(result.data[0] ?? null)
      })
      .catch(() => toast.error("Could not load express rates"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="portal-quote__form-loading">
        <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
      </div>
    )
  }

  return (
    <div className="portal-quote__form">
      <TemplateChips items={templates} selected={selected} onSelect={setSelected} />
      <PortalFormField label="Quantity">
        <PortalFormInput
          type="number"
          min={1}
          value={numberOfItems}
          onChange={(e) => setNumberOfItems(Number(e.target.value))}
        />
      </PortalFormField>
      <button
        type="button"
        className="portal-quote__btn-primary portal-quote__btn-primary--block"
        onClick={() =>
          addToCart({
            id: Date.now(),
            name: selected?.name ?? "",
            weight: 0,
            unit: "kg",
            numberOfItems,
          })
        }
      >
        Add to quote
      </button>
    </div>
  )
}

export function PortalQuoteItemForm({
  channel,
  addToCart,
}: {
  channel: QuoteChannel
  addToCart: AddToCart
}) {
  switch (channel) {
    case "sea":
      return <PortalQuoteSeaForm addToCart={addToCart} />
    case "express":
      return <PortalQuoteExpressForm addToCart={addToCart} />
    default:
      return <PortalQuoteAirForm addToCart={addToCart} />
  }
}
