import { calculateDeliveryZonePrice } from "@/lib/calculators/calculateDeliveryZonePrice"
import type { ShopDeliveryFeeQuote } from "@/lib/shop/deliveryFee"

export async function fetchShopDeliveryQuote(
  state: string
): Promise<ShopDeliveryFeeQuote> {
  const [zoneFee, settingsRes] = await Promise.all([
    calculateDeliveryZonePrice(state),
    fetch("/api/shop/settings", { credentials: "include" }).then((r) => r.json()),
  ])

  const freeDelivery =
    settingsRes?.success && settingsRes?.data?.free_delivery_enabled === true
  const normalizedZoneFee = Number(zoneFee) || 0

  return {
    zoneFee: normalizedZoneFee,
    chargedFee: freeDelivery ? 0 : normalizedZoneFee,
    freeDelivery,
  }
}
