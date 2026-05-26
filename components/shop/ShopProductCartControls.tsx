"use client"

import { useCartStore } from "@/store/cartStore"
import { IconMinus, IconPlus, IconShoppingCartPlus } from "@tabler/icons-react"
import type { MouseEvent } from "react"

type ShopProductCartControlsProps = {
  productId: number
  stockQuantity: number
  disabled?: boolean
  onAdd: (e: MouseEvent<HTMLButtonElement>) => void
  addAriaLabel: string
}

export function ShopProductCartControls({
  productId,
  stockQuantity,
  disabled = false,
  onAdd,
  addAriaLabel,
}: ShopProductCartControlsProps) {
  const cartItem = useCartStore((s) => s.cart.find((item) => item.id === productId))
  const increaseAmount = useCartStore((s) => s.increaseAmount)
  const decreaseAmount = useCartStore((s) => s.decreaseAmount)
  const removeProduct = useCartStore((s) => s.removeProduct)

  if (!cartItem) {
    return (
      <button
        type="button"
        className="shop-product-card__cart-btn"
        disabled={disabled || stockQuantity < 1}
        aria-label={addAriaLabel}
        onClick={onAdd}
      >
        <IconShoppingCartPlus size={20} stroke={1.5} aria-hidden />
      </button>
    )
  }

  const atMax = cartItem.amount_to_be_ordered >= stockQuantity

  const handleDecrease = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartItem.amount_to_be_ordered <= 1) {
      removeProduct(productId)
      return
    }
    decreaseAmount(productId)
  }

  const handleIncrease = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!atMax) increaseAmount(productId)
  }

  return (
    <div
      className="shop-product-card__qty"
      role="group"
      aria-label={`Quantity: ${cartItem.amount_to_be_ordered}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="shop-product-card__qty-btn"
        onClick={handleDecrease}
        aria-label={
          cartItem.amount_to_be_ordered <= 1
            ? "Remove from cart"
            : "Decrease quantity"
        }
      >
        <IconMinus size={16} stroke={2} aria-hidden />
      </button>
      <span className="shop-product-card__qty-value tabular-nums">
        {cartItem.amount_to_be_ordered}
      </span>
      <button
        type="button"
        className="shop-product-card__qty-btn shop-product-card__qty-btn--primary"
        onClick={handleIncrease}
        disabled={atMax}
        aria-label="Increase quantity"
      >
        <IconPlus size={16} stroke={2} aria-hidden />
      </button>
    </div>
  )
}
