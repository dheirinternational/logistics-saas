"use client"

import { ShopProductCartControls } from "@/components/shop/ShopProductCartControls"
import type { MarketingShopProduct } from "@/lib/marketing/shopCatalog"
import { useCartStore } from "@/store/cartStore"
import Image from "next/image"
import Link from "next/link"
import type { MouseEvent } from "react"
import { toast } from "@/lib/ui/toast"

type ShopProductCardProps = {
  product: MarketingShopProduct
  categoryLabel?: string
  detailHref: string
  isAuthenticated?: boolean
}

export function ShopProductCard({
  product,
  categoryLabel,
  detailHref,
}: ShopProductCardProps) {
  const addProduct = useCartStore((s) => s.addProduct)

  const displayPrice =
    product.discount_price &&
    Number(product.discount_price) > 0 &&
    Number(product.discount_price) < Number(product.price)
      ? Number(product.discount_price)
      : Number(product.price)

  const label =
    categoryLabel ||
    (product.category_name
      ? product.category_name.charAt(0).toUpperCase() + product.category_name.slice(1)
      : "Shop")

  const imageSrc = product.image_url ?? ""

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!imageSrc) {
      toast.error("Product image unavailable")
      return
    }

    addProduct({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      discount_price: Number(product.discount_price ?? 0),
      quantity: product.stock_quantity,
      image: imageSrc,
      amount_to_be_ordered: 1,
    })
    toast.success("Added to cart. Sign in to checkout.")
  }

  return (
    <article className="shop-product-card group">
      <Link href={detailHref} className="shop-product-card__media block">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 260px"
            className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm text-dheir-muted">
            No image
          </span>
        )}
      </Link>

      <div className="shop-product-card__body">
        <p className="shop-product-card__category">{label}</p>
        <Link href={detailHref} className="shop-product-card__name">
          {product.name}
        </Link>
        <div className="shop-product-card__footer">
          <p className="shop-product-card__price tabular-nums">
            ₦{displayPrice.toLocaleString()}
          </p>
          <ShopProductCartControls
            productId={product.id}
            stockQuantity={product.stock_quantity}
            disabled={!imageSrc}
            onAdd={handleAddToCart}
            addAriaLabel={`Add ${product.name} to cart`}
          />
        </div>
      </div>
    </article>
  )
}
