"use client"

import {
  QUOTE_RATE_NOTICES,
  QUOTE_SPECIAL_GOODS,
} from "@/lib/portal/quote/constants"
import { IconHelp } from "@tabler/icons-react"
import { useState } from "react"

export function PortalQuoteInfoPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className="portal-quote__info">
      <button
        type="button"
        className="portal-quote__info-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <IconHelp size={18} stroke={1.5} aria-hidden />
        Rates & special goods
      </button>
      {open ? (
        <div className="portal-quote__info-panel">
          <section>
            <h3 className="portal-quote__info-title">Special goods</h3>
            <ul className="portal-quote__info-list">
              {QUOTE_SPECIAL_GOODS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="portal-quote__info-title">Good to know</h3>
            <ul className="portal-quote__info-list">
              {QUOTE_RATE_NOTICES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  )
}
