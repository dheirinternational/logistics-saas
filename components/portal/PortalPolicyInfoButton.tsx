"use client"

import type { CustomerPolicy } from "@/lib/portal/customerPolicies"
import { IconInfoCircle } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { useEffect, useId, useRef, useState } from "react"

type PortalPolicyInfoButtonProps = {
  policy: CustomerPolicy
  /** Accessible name for the trigger button */
  label?: string
  className?: string
}

export function PortalPolicyInfoButton({
  policy,
  label = "View policy",
  className,
}: PortalPolicyInfoButtonProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onEscape)
    }
  }, [open])

  return (
    <span
      ref={rootRef}
      className={`portal-policy-info${className ? ` ${className}` : ""}`}
    >
      <button
        type="button"
        className="portal-policy-info__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <IconInfoCircle size={17} stroke={1.5} aria-hidden />
      </button>

      {open ? (
        <div
          id={panelId}
          className="portal-policy-info__panel"
          role="dialog"
          aria-label={policy.title}
        >
          <p className="portal-policy-info__panel-title">{policy.title}</p>
          {policy.sections.map((section) => (
            <section key={section.title} className="portal-policy-info__section">
              <h3 className="portal-policy-info__section-title">{section.title}</h3>
              <ul className="portal-policy-info__list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </span>
  )
}

type PortalPolicyLabelProps = {
  policy: CustomerPolicy
  label?: string
  children: ReactNode
}

/** Inline label text with an info button — e.g. cart “Delivery” row. */
export function PortalPolicyLabel({ policy, label, children }: PortalPolicyLabelProps) {
  return (
    <span className="portal-policy-info__label-row">
      {children}
      <PortalPolicyInfoButton policy={policy} label={label ?? `About ${String(children)}`} />
    </span>
  )
}
