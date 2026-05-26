"use client"

import { IconChevronDown } from "@tabler/icons-react"
import type { SelectHTMLAttributes } from "react"

export type DheirSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Toolbar / filter height (44px); default matches text inputs (52px). */
  compact?: boolean
}

export function DheirSelect({
  className = "",
  compact = false,
  ...props
}: DheirSelectProps) {
  return (
    <div
      className={`dheir-select-wrap${compact ? " dheir-select-wrap--compact" : ""}`}
    >
      <select
        className={[
          "dheir-select",
          compact ? "dheir-select--compact" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      <IconChevronDown
        className="dheir-select__icon"
        size={18}
        stroke={1.5}
        aria-hidden
      />
    </div>
  )
}
