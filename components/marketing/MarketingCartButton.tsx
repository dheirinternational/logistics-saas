"use client"

import { useCartStore } from "@/store/cartStore"
import { IconShoppingCart } from "@tabler/icons-react"
import Link from "next/link"

type MarketingCartButtonProps = {
  onHero: boolean
  onNavigate?: () => void
  className?: string
}

export function MarketingCartButton({
  onHero,
  onNavigate,
  className = "",
}: MarketingCartButtonProps) {
  const cartCount = useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.amount_to_be_ordered, 0)
  )

  return (
    <Link
      href="/base/marketplace/cart"
      className={`marketing-header-cart ${className}`}
      aria-label={
        cartCount > 0
          ? `Shopping cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
          : "Shopping cart"
      }
      onClick={onNavigate}
    >
      <IconShoppingCart
        size={22}
        stroke={1.5}
        className={onHero ? "text-white" : "text-dheir-ink"}
        aria-hidden
      />
      {cartCount > 0 && (
        <span className="marketing-header-cart__badge" aria-hidden>
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  )
}
