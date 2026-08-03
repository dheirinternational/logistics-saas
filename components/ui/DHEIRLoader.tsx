import type { CSSProperties } from "react"

type DHEIRLoaderSize = "xs" | "sm" | "md" | "lg"

export type DHEIRLoaderProps = {
  /** Pixel diameter, or a preset size token. */
  size?: number | DHEIRLoaderSize
  /** Preset color when `color` is not set. */
  variant?: "brand" | "white" | "accent" | "muted"
  /** Legacy prop from react-spinners - still supported for gradual migration. */
  color?: string
  label?: string
  /** Center in a min-height block with optional label (page-level loading). */
  block?: boolean
  className?: string
}

const SIZE_PX: Record<DHEIRLoaderSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
}

const VARIANT_COLOR: Record<NonNullable<DHEIRLoaderProps["variant"]>, string> = {
  brand: "var(--color-dheir-blue)",
  white: "#ffffff",
  accent: "var(--color-dheir-red)",
  muted: "var(--color-dheir-muted)",
}

function resolveSize(size: DHEIRLoaderProps["size"]): number {
  if (size === undefined) return SIZE_PX.md
  if (typeof size === "number") return size
  return SIZE_PX[size]
}

function resolveColor(
  color: string | undefined,
  variant: DHEIRLoaderProps["variant"],
): string {
  if (color) {
    const normalized = color.toLowerCase().replace(/\s/g, "")
    if (
      normalized === "#fff" ||
      normalized === "#ffffff" ||
      normalized === "white"
    ) {
      return VARIANT_COLOR.white
    }
    if (
      normalized === "orange" ||
      normalized.includes("f26430") ||
      normalized.includes("accent-red")
    ) {
      return VARIANT_COLOR.accent
    }
    if (
      normalized.includes("dheir-blue") ||
      normalized === "#1a5fff" ||
      normalized === "#005eff" ||
      normalized === "#3b82f6" ||
      normalized === "blue"
    ) {
      return VARIANT_COLOR.brand
    }
    if (normalized === "red" || normalized.includes("ef4444")) {
      return VARIANT_COLOR.accent
    }
    if (normalized === "black" || normalized === "#000") {
      return VARIANT_COLOR.brand
    }
    return color
  }
  return VARIANT_COLOR[variant ?? "brand"]
}

export function DHEIRLoader({
  size,
  variant = "brand",
  color,
  label,
  block = false,
  className = "",
}: DHEIRLoaderProps) {
  const px = resolveSize(size)
  const strokeColor = resolveColor(color, variant)
  const spinner = (
    <span
      className={`dheir-loader${className ? ` ${className}` : ""}`}
      style={
        {
          "--dheir-loader-size": `${px}px`,
          "--dheir-loader-color": strokeColor,
        } as CSSProperties
      }
      role="status"
      aria-label={label ?? "Loading"}
    />
  )

  if (!block) return spinner

  return (
    <div className="dheir-loader-block">
      {spinner}
      {label ? <p className="dheir-loader-block__label">{label}</p> : null}
    </div>
  )
}
