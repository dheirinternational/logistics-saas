"use client"

import type { InputHTMLAttributes, ReactNode } from "react"

type AuthFieldProps = {
  label: string
  icon?: ReactNode
  trailing?: ReactNode
  wrapperClassName?: string
} & InputHTMLAttributes<HTMLInputElement>

export function AuthField({
  label,
  icon,
  trailing,
  className = "",
  wrapperClassName = "",
  id,
  ...inputProps
}: AuthFieldProps) {
  const inputId = id ?? inputProps.name

  return (
    <label className={`block ${wrapperClassName}`} htmlFor={inputId}>
      <span className="mb-2 block text-[13px] font-medium text-dheir-ink">
        {label}
      </span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-dheir-muted">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={`dheir-input ${icon ? "pl-11" : "pl-4"} ${trailing ? "pr-12" : "pr-4"} ${className}`}
          {...inputProps}
        />
        {trailing ? (
          <span className="absolute right-1 top-1/2 z-10 -translate-y-1/2">
            {trailing}
          </span>
        ) : null}
      </span>
    </label>
  )
}
