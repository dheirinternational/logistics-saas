export type ProductWeightUnit = "kg" | "cbm"

export const PRODUCT_WEIGHT_UNITS: ProductWeightUnit[] = ["kg", "cbm"]

export function isValidProductWeightUnit(value: string): value is ProductWeightUnit {
  return value === "kg" || value === "cbm"
}

export function getProductWeightFieldLabel(unit: ProductWeightUnit | string | null | undefined) {
  return unit === "cbm" ? "Volume (CBM)" : "Weight (kg)"
}

export function normalizeProductWeightUnit(
  value: string | null | undefined
): ProductWeightUnit {
  return value === "cbm" ? "cbm" : "kg"
}
