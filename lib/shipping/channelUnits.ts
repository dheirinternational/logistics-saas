import type { ShippingType } from "@/types/miscallaneous"

export type ShippingMeasureUnit = "kg" | "CBM"

export function normalizeShippingChannel(
  channel: string | null | undefined,
): ShippingType | null {
  if (!channel) return null
  const key = channel.trim().toLowerCase()
  if (key === "air" || key === "air_gz" || key === "air gz") return "air_gz"
  if (key === "air_hk" || key === "air hk") return "air_hk"
  if (key === "sea") return "sea"
  if (key === "express") return "express"
  return null
}

export function isSeaChannel(channel: string | null | undefined): boolean {
  return normalizeShippingChannel(channel) === "sea"
}

/** Sea → CBM; air and express → kg. */
export function getShippingMeasureUnit(
  channel: string | null | undefined,
): ShippingMeasureUnit {
  return isSeaChannel(channel) ? "CBM" : "kg"
}

export function getShippingMeasureUnitLabel(
  channel: string | null | undefined,
): string {
  return getShippingMeasureUnit(channel)
}

/** Field label for shipment quantity inputs/displays. */
export function getShippingQuantityFieldLabel(
  channel: string | null | undefined,
): string {
  return isSeaChannel(channel) ? "Volume (CBM)" : "Weight (kg)"
}

/** Short label for tables and summary rows. */
export function getShippingQuantityShortLabel(
  channel: string | null | undefined,
): string {
  return isSeaChannel(channel) ? "Volume" : "Weight"
}

export function formatShippingChannel(channel: string | null | undefined): string {
  const normalized = normalizeShippingChannel(channel)
  if (!normalized) return channel?.trim() || "-"
  if (normalized === "air_gz") return "Air Gz"
  if (normalized === "air_hk") return "Air HK"
  if (normalized === "sea") return "Sea"
  if (normalized === "express") return "Express"
  return normalized
}

export function formatShippingQuantity(
  value: number | string | null | undefined,
  channel: string | null | undefined,
  options?: { decimals?: number; fallback?: string },
): string {
  const fallback = options?.fallback ?? "-"
  if (value == null || value === "") return fallback
  const num = Number(value)
  if (!Number.isFinite(num)) return fallback

  const decimals = options?.decimals ?? 2
  const unit = getShippingMeasureUnit(channel)
  return `${num.toFixed(decimals)} ${unit}`
}
