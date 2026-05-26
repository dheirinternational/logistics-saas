"use client"

import { ShopProductCartControls } from "@/components/shop/ShopProductCartControls"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { useCartStore } from "@/store/cartStore"
import type { Product } from "@/types/entityTypeDef"
import Image from "next/image"
import Link from "next/link"
import type { MouseEvent } from "react"
import { useEffect, useState } from "react"
import { toast } from "@/lib/ui/toast"

type PortalShopProductCardProps = {
  product: Product
  categoryLabel?: string
}

export function PortalShopProductCard({
  product,
  categoryLabel = "Shop",
}: PortalShopProductCardProps) {
  const addProduct = useCartStore((s) => s.addProduct)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(true)

  const displayPrice =
    product.discount_price &&
    Number(product.discount_price) > 0 &&
    Number(product.discount_price) < Number(product.price)
      ? Number(product.discount_price)
      : Number(product.price)

  const detailHref = `/base/marketplace/${product.id}`

  useEffect(() => {
    let cancelled = false
    setLoadingImage(true)
    fetch(`/api/products/images/${product.id}`)
      .then((r) => r.json())
      .then((result) => {
        if (!cancelled) setImageUrl(result.data?.[0]?.image_url ?? null)
      })
      .finally(() => {
        if (!cancelled) setLoadingImage(false)
      })
    return () => {
      cancelled = true
    }
  }, [product.id])

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!imageUrl) {
      toast.error("Product image still loading")
      return
    }

    addProduct({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      discount_price: Number(product.discount_price ?? 0),
      quantity: product.stock_quantity,
      image: imageUrl,
      amount_to_be_ordered: 1,
    })
    toast.success("Added to cart")
  }

  return (
    <article className="shop-product-card group">
      <Link href={detailHref} className="shop-product-card__media block">
        {loadingImage ? (
          <span className="flex h-full w-full items-center justify-center">
            <DheirLoader size={8} color="var(--color-dheir-blue)" />
          </span>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
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
        <p className="shop-product-card__category">{categoryLabel}</p>
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
            disabled={loadingImage || !imageUrl}
            onAdd={handleAddToCart}
            addAriaLabel={`Add ${product.name} to cart`}
          />
        </div>
      </div>
    </article>
  )
}
