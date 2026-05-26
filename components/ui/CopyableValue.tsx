"use client"

import { IconCheck, IconCopy } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { toast } from "@/lib/ui/toast"

type CopyableValueProps = {
  value: string
  label?: string
  successMessage?: string
  layout?: "stacked" | "inline" | "pill"
  className?: string
  valueClassName?: string
}

export function CopyableValue({
  value,
  label,
  successMessage,
  layout = "inline",
  className = "",
  valueClassName = "",
}: CopyableValueProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    if (!value.trim()) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(successMessage ?? "Copied to clipboard")
    } catch {
      toast.error("Could not copy")
    }
  }

  const copyButton = (
    <button
      type="button"
      className="copyable-value__btn"
      onClick={() => void handleCopy()}
      aria-label={label ? `Copy ${label}` : "Copy"}
    >
      {copied ? (
        <IconCheck size={16} stroke={2} aria-hidden />
      ) : (
        <IconCopy size={16} stroke={1.5} aria-hidden />
      )}
    </button>
  )

  if (layout === "stacked") {
    return (
      <div className={`copyable-value copyable-value--stacked${className ? ` ${className}` : ""}`}>
        {label ? <span className="copyable-value__label">{label}</span> : null}
        <div className="copyable-value__row">
          <span className={`copyable-value__value${valueClassName ? ` ${valueClassName}` : ""}`}>
            {value}
          </span>
          {copyButton}
        </div>
      </div>
    )
  }

  if (layout === "pill") {
    return (
      <div className={`copyable-value copyable-value--pill${className ? ` ${className}` : ""}`}>
        {label ? <span className="copyable-value__label">{label}</span> : null}
        <span className={`copyable-value__value${valueClassName ? ` ${valueClassName}` : ""}`}>
          {value}
        </span>
        {copyButton}
      </div>
    )
  }

  return (
    <div className={`copyable-value copyable-value--inline${className ? ` ${className}` : ""}`}>
      {label ? <span className="copyable-value__label">{label}</span> : null}
      <span className={`copyable-value__value${valueClassName ? ` ${valueClassName}` : ""}`}>
        {value}
      </span>
      {copyButton}
    </div>
  )
}
