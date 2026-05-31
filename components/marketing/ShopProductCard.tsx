"use client"

import { ShopProductCartControls } from "@/components/shop/ShopProductCartControls"
import type { MarketingShopProduct } from "@/lib/marketing/shopCatalog"
import { useCartStore } from "@/store/cartStore"
import { getTierPricingLabel, getUnitPriceForQuantity, hasTierDiscount } from "@/lib/shop/pricing"
import { ProductStorageImage } from "@/components/shop/ProductStorageImage"
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

  const displayPrice = getUnitPriceForQuantity({
    price: Number(product.price),
    discount_price: Number(product.discount_price ?? 0),
    discount_min_qty: Number(product.discount_min_qty ?? 0),
    quantity: 1,
  })
  const tierPricingLabel = getTierPricingLabel({
    price: Number(product.price),
    discount_price: Number(product.discount_price ?? 0),
    discount_min_qty: Number(product.discount_min_qty ?? 0),
  })

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
      discount_min_qty: product.discount_min_qty ?? null,
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
          <ProductStorageImage
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 260px"
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
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
        {hasTierDiscount(product) && tierPricingLabel ? (
          <p className="shop-product-card__meta">{tierPricingLabel}</p>
        ) : null}
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
