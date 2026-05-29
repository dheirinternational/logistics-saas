import { isValidProductWeightUnit } from "@/lib/shop/productWeight"

export type ProductCreateInput = {
  name: string
  description: string
  category_id: number
  price: number
  discount_price: number
  discount_min_qty: number | null
  stock_quantity: number
  weight: number
  weight_unit: string
  is_featured: boolean
}

export function validateProductCreateInput(data: ProductCreateInput): string | null {
  if (data.price === 0) {
    return "Invalid Price Range"
  }
  if (data.discount_price > 0 && data.discount_price >= data.price) {
    return "Discounted price must be less than price"
  }
  if (data.discount_min_qty !== null && data.discount_min_qty < 2) {
    return "Qty for discounted price must be at least 2"
  }
  if (
    data.discount_price > 0 &&
    (data.discount_min_qty === null || data.discount_min_qty < 2)
  ) {
    return "Qty for discounted price is required when a discounted price is set"
  }
  if (!data.category_id || Number.isNaN(data.category_id)) {
    return "Select a valid category"
  }
  if (!isValidProductWeightUnit(data.weight_unit)) {
    return "Weight unit must be kg or cbm"
  }
  if (data.weight <= 0) {
    return "Product weight must be greater than 0"
  }
  return null
}
