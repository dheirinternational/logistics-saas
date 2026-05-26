"use client"

import { formatPaymentAmount } from "@/lib/portal/paymentDisplay"
import Image from "next/image"

export type PortalOrderLineItemData = {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  image: string
}

type PortalOrderLineItemProps = {
  item: PortalOrderLineItemData
}

export function PortalOrderLineItem({ item }: PortalOrderLineItemProps) {
  const imageSrc = item.image?.trim()

  return (
    <div className="portal-cart-item portal-order-item">
      <figure className="portal-cart-item__media">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="80px"
            className="object-contain p-2"
          />
        ) : (
          <span className="portal-order-item__placeholder" aria-hidden>
            No image
          </span>
        )}
      </figure>

      <div className="portal-cart-item__body">
        <div className="portal-cart-item__top">
          <div className="portal-cart-item__title-wrap">
            <p className="portal-cart-item__name">{item.product_name}</p>
            <p className="portal-cart-item__meta">
              Qty {item.quantity} · {formatPaymentAmount(item.unit_price)} each
            </p>
          </div>
          <p className="portal-cart-item__price tabular-nums">
            {formatPaymentAmount(item.subtotal)}
          </p>
        </div>
      </div>
    </div>
  )
}
