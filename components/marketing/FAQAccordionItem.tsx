"use client"

import type { FAQ } from "@/types/miscallaneous"
import { IconChevronDown } from "@tabler/icons-react"
import { useId, useState } from "react"

type FAQAccordionItemProps = FAQ & {
  defaultOpen?: boolean
}

export function FAQAccordionItem({
  question,
  answer,
  defaultOpen = false,
}: FAQAccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className={`faq-item ${open ? "is-open" : ""}`}>
      <h3 className="faq-item__heading">
        <button
          id={buttonId}
          type="button"
          className="faq-item__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="faq-item__question font-display">{question}</span>
          <span className="faq-item__chevron" aria-hidden>
            <IconChevronDown size={20} stroke={1.75} />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-item__panel"
      >
        <div className="faq-item__panel-inner">
          <p className="faq-item__answer">{answer}</p>
        </div>
      </div>
    </div>
  )
}
