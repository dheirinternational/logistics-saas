"use client"

import { IconTicket } from "@tabler/icons-react"

type ShopDeliveryFeeDisplayProps = {
  zoneFee: number
  chargedFee: number
  freeDelivery: boolean
  loading?: boolean
}

export function ShopDeliveryFeeDisplay({
  zoneFee,
  chargedFee,
  freeDelivery,
  loading = false,
}: ShopDeliveryFeeDisplayProps) {
  if (loading) {
    return <span className="portal-cart__muted">Loading…</span>
  }

  if (freeDelivery && zoneFee > 0) {
    return (
      <span className="portal-cart__delivery-pricing">
        <IconTicket
          size={18}
          stroke={1.5}
          aria-hidden
          className="portal-cart__delivery-promo-icon"
        />
        <span className="portal-cart__delivery-was tabular-nums">
          ₦{zoneFee.toLocaleString()}
        </span>
        <strong className="portal-cart__delivery-free tabular-nums">
          ₦0 · Free delivery
        </strong>
      </span>
    )
  }

  return (
    <strong className="tabular-nums">₦{chargedFee.toLocaleString()}</strong>
  )
}
