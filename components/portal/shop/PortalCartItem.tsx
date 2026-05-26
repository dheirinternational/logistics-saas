"use client"

import { useCartStore } from "@/store/cartStore"
import type { CartProduct } from "@/types/entityTypeDef"
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react"
import Image from "next/image"

type PortalCartItemProps = {
  item: CartProduct
}

export function PortalCartItem({ item }: PortalCartItemProps) {
  const removeProduct = useCartStore((s) => s.removeProduct)
  const increaseAmount = useCartStore((s) => s.increaseAmount)
  const decreaseAmount = useCartStore((s) => s.decreaseAmount)
  const editIndividualItem = useCartStore((s) => s.editIndividualItem)

  const unitPrice =
    item.discount_price && item.discount_price > 0 ? item.discount_price : item.price
  const lineTotal = unitPrice * item.amount_to_be_ordered

  return (
    <div className="portal-cart-item">
      <figure className="portal-cart-item__media">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="80px"
          className="object-contain p-2"
        />
      </figure>

      <div className="portal-cart-item__body">
        <div className="portal-cart-item__top">
          <div className="portal-cart-item__title-wrap">
            <p className="portal-cart-item__name">{item.name}</p>
            <p className="portal-cart-item__meta">
              {item.quantity > 0 ? "In stock" : "Out of stock"}
            </p>
          </div>
          <p className="portal-cart-item__price tabular-nums">
            ₦{lineTotal.toLocaleString()}
          </p>
        </div>

        <div className="portal-cart-item__controls">
          <button
            type="button"
            className="portal-cart-item__qty-btn"
            onClick={() => decreaseAmount(item.id)}
            disabled={item.amount_to_be_ordered < 2}
            aria-label="Decrease quantity"
          >
            <IconMinus size={18} stroke={1.5} aria-hidden />
          </button>

          <input
            className="portal-cart-item__qty-input"
            type="number"
            min={1}
            value={item.amount_to_be_ordered}
            onChange={(e) => editIndividualItem(Number(e.currentTarget.value), item.id)}
            aria-label="Quantity"
          />

          <button
            type="button"
            className="portal-cart-item__qty-btn portal-cart-item__qty-btn--primary"
            onClick={() => increaseAmount(item.id)}
            disabled={item.amount_to_be_ordered > item.quantity - 1}
            aria-label="Increase quantity"
          >
            <IconPlus size={18} stroke={1.5} aria-hidden />
          </button>

          <span className="portal-cart-item__unit tabular-nums">
            ₦{Number(unitPrice).toLocaleString()} each
          </span>

          <button
            type="button"
            className="portal-cart-item__remove"
            onClick={() => removeProduct(item.id)}
            aria-label="Remove item"
          >
            <IconTrash size={18} stroke={1.5} aria-hidden />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

