"use client"

import { useCartStore } from "@/store/cartStore"
import { IconShoppingCart } from "@tabler/icons-react"
import Link from "next/link"

export function PortalHeaderCart() {
  const cartCount = useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.amount_to_be_ordered, 0),
  )

  return (
    <Link
      href="/customer/marketplace/cart"
      className="portal-header__icon-btn portal-header__cart"
      aria-label={
        cartCount > 0
          ? `Shopping cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
          : "Shopping cart"
      }
    >
      <IconShoppingCart size={22} stroke={1.5} aria-hidden />
      {cartCount > 0 ? (
        <span className="portal-header__cart-badge" aria-hidden>
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      ) : null}
    </Link>
  )
}
