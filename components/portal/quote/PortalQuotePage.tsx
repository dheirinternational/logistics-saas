"use client"

import { PortalQuoteInfoPanel } from "@/components/portal/quote/PortalQuoteInfoPanel"
import { PortalQuoteItemForm } from "@/components/portal/quote/PortalQuoteItemForms"
import { PortalQuotePageHeader } from "@/components/portal/quote/PortalQuotePageHeader"
import { formatGoodLabel, formatMoney } from "@/lib/portal/quote/format"
import type {
  MoneyExchangeRate,
  QuoteChannel,
  QuoteCurrency,
  QuoteItemCart,
  QuoteResult,
} from "@/lib/portal/quote/types"
import { generateAirShippingQuotation } from "@/lib/calculators/generateAirShippingQuotation"
import { generateExpressShippingQuotation } from "@/lib/calculators/generateExpressShippingQuotation"
import { generateSeaShippingQuotation } from "@/lib/calculators/generateSeaShippingQuotation"
import { IconPlane, IconShip, IconTruck } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

const CHANNELS: {
  id: QuoteChannel
  label: string
  icon: typeof IconPlane
}[] = [
  { id: "air", label: "Air", icon: IconPlane },
  { id: "sea", label: "Sea", icon: IconShip },
  { id: "express", label: "Express", icon: IconTruck },
]

export function PortalQuotePage() {
  const [channel, setChannel] = useState<QuoteChannel>("air")
  const [itemCart, setItemCart] = useState<QuoteItemCart[]>([])
  const [quotation, setQuotation] = useState<QuoteResult | null>(null)
  const [rates, setRates] = useState<MoneyExchangeRate[]>([])
  const [currency, setCurrency] = useState<QuoteCurrency>("Dollar")
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [loadingRates, setLoadingRates] = useState(true)

  const nairaRate = rates[0]?.currency_two ?? 0

  useEffect(() => {
    fetch("/api/money-exchange-rate")
      .then((r) => r.json())
      .then((result) => {
        if (result.data) setRates(result.data)
      })
      .catch(() => toast.error("Could not load exchange rates"))
      .finally(() => setLoadingRates(false))
  }, [])

  useEffect(() => {
    if (channel === "sea") setCurrency("Naira")
  }, [channel])

  useEffect(() => {
    if (itemCart.length === 0) {
      setQuotation(null)
      return
    }

    let cancelled = false
    setLoadingQuote(true)

    const run = async () => {
      try {
        let result: QuoteResult | undefined
        switch (channel) {
          case "sea":
            result = await generateSeaShippingQuotation(itemCart)
            break
          case "express":
            result = await generateExpressShippingQuotation(itemCart)
            break
          default:
            result = await generateAirShippingQuotation(itemCart)
        }
        if (!cancelled) setQuotation(result ?? null)
      } catch (err) {
        console.error(err)
        if (!cancelled) toast.error("Could not generate quotation")
      } finally {
        if (!cancelled) setLoadingQuote(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [itemCart, channel])

  const addToCart = (item: QuoteItemCart) => {
    setItemCart((prev) => [...prev, item])
  }

  const removeFromCart = (id: number) => {
    setItemCart((prev) => prev.filter((item) => item.id !== id))
  }

  const switchChannel = (next: QuoteChannel) => {
    setChannel(next)
    setItemCart([])
    setQuotation(null)
  }

  const convertToNaira = currency === "Naira" && channel !== "sea"

  const totalDisplay = useMemo(() => {
    if (!quotation) return "-"
    return formatMoney(
      quotation.totalPrice,
      currency,
      nairaRate,
      convertToNaira,
    )
  }, [quotation, currency, nairaRate, convertToNaira])

  return (
    <div className="portal-quote">
      <PortalQuotePageHeader
        title="Get a quote"
        description="Estimate shipping from China to Nigeria before you buy. Add items, pick air, sea, or express, and see a live total."
        action={<PortalQuoteInfoPanel />}
      />

      <div className="portal-quote__rates-card">
        {loadingRates ? (
          <DheirLoader size={8} color="var(--color-dheir-blue)" />
        ) : (
          <>
            <p className="portal-quote__rates-line">
              <span>Exchange rate</span>
              <strong>
                $1 = ₦{nairaRate.toLocaleString()}
              </strong>
            </p>
            <div className="portal-quote__currency">
              <button
                type="button"
                className={`portal-quote__currency-btn${currency === "Dollar" ? " is-active" : ""}`}
                disabled={channel === "sea"}
                onClick={() => setCurrency("Dollar")}
              >
                USD
              </button>
              <button
                type="button"
                className={`portal-quote__currency-btn${currency === "Naira" ? " is-active" : ""}`}
                onClick={() => setCurrency("Naira")}
              >
                NGN
              </button>
            </div>
          </>
        )}
      </div>

      <div className="portal-quote__layout">
        <section className="portal-quote__panel">
          <h2 className="portal-quote__panel-title">Build your quote</h2>

          <div className="portal-quote__channels" role="tablist">
            {CHANNELS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={channel === id}
                className={`portal-quote__channel${channel === id ? " is-active" : ""}`}
                onClick={() => switchChannel(id)}
              >
                <Icon size={18} stroke={1.5} aria-hidden />
                {label}
              </button>
            ))}
          </div>

          <PortalQuoteItemForm channel={channel} addToCart={addToCart} />
        </section>

        <section className="portal-quote__panel portal-quote__panel--summary">
          <h2 className="portal-quote__panel-title">Summary</h2>

          <div className="portal-quote__cart">
            {itemCart.length === 0 ? (
              <p className="portal-quote__empty">Add items to see your estimate.</p>
            ) : (
              itemCart.map((item) => (
                <div key={item.id} className="portal-quote__cart-row">
                  <div>
                    <p className="portal-quote__cart-name">
                      {formatGoodLabel(item.name)}
                    </p>
                    <p className="portal-quote__cart-meta">
                      {channel !== "express" && (
                        <>
                          {item.weight}
                          {item.unit === "cbm" ? " CBM" : " kg"}
                          {" · "}
                        </>
                      )}
                      {item.numberOfItems}{" "}
                      {item.numberOfItems === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="portal-quote__cart-remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="portal-quote__receipt">
            <div className="portal-quote__receipt-head">
              <span className="portal-quote__brand">DHEIR International</span>
              {loadingQuote ? (
                <DheirLoader size={8} color="var(--color-dheir-blue)" />
              ) : null}
            </div>
            <p className="portal-quote__receipt-channel">
              Channel: {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </p>

            <div className="portal-quote__receipt-lines">
              {!quotation || quotation.goods.every((g) => g.quantity === 0) ? (
                <p className="portal-quote__empty">No quotation yet.</p>
              ) : (
                quotation.goods
                  .filter((g) => g.quantity > 0)
                  .map((good) => (
                    <article key={good.itemName} className="portal-quote__line">
                      <p className="portal-quote__line-name">
                        {formatGoodLabel(good.itemName)} × {good.quantity}
                      </p>
                      <p>
                        Price:{" "}
                        {formatMoney(
                          good.price,
                          currency,
                          nairaRate,
                          convertToNaira,
                        )}
                      </p>
                      <p>
                        {good.clearanceFee === "0.00"
                          ? "Clearance included in price"
                          : `Clearance: ₦${Number(good.clearanceFee).toLocaleString()}`}
                      </p>
                      <p className="portal-quote__line-delivery">
                        {good.expectedDeliveryWindow}
                      </p>
                    </article>
                  ))
              )}
            </div>

            <div className="portal-quote__total">
              <span>Estimated total</span>
              <strong>{totalDisplay}</strong>
            </div>

            <p className="portal-quote__disclaimer">
              Estimate only. Final cost is confirmed when you register packages
              and request shipment in your account.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
