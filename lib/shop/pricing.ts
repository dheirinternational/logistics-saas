type TierPriceInput = {
  price: number
  discount_price?: number | null
  discount_min_qty?: number | null
  quantity?: number
}

export function hasTierDiscount(input: TierPriceInput) {
  const basePrice = Number(input.price || 0)
  const discountedPrice = Number(input.discount_price || 0)
  const tierQty = Number(input.discount_min_qty || 0)

  return basePrice > 0 && discountedPrice > 0 && discountedPrice < basePrice && tierQty > 1
}

/** Discount applies only when cart quantity exactly matches discount_min_qty. */
export function isTierDiscountApplied(input: TierPriceInput) {
  const tierQty = Number(input.discount_min_qty || 0)
  const quantity = Math.max(1, Number(input.quantity || 1))

  return (
    hasTierDiscount({
      price: input.price,
      discount_price: input.discount_price,
      discount_min_qty: tierQty,
    }) && quantity === tierQty
  )
}

export function getUnitPriceForQuantity(input: TierPriceInput) {
  const basePrice = Number(input.price || 0)
  const discountedPrice = Number(input.discount_price || 0)

  if (isTierDiscountApplied(input)) {
    return discountedPrice
  }

  return basePrice
}

export function getTierPricingLabel(input: TierPriceInput) {
  const basePrice = Number(input.price || 0)
  const discountedPrice = Number(input.discount_price || 0)
  const tierQty = Number(input.discount_min_qty || 0)

  if (
    !hasTierDiscount({
      price: basePrice,
      discount_price: discountedPrice,
      discount_min_qty: tierQty,
    })
  ) {
    return null
  }

  return `Discounted at ${tierQty}x for ₦${discountedPrice.toLocaleString()}`
}
