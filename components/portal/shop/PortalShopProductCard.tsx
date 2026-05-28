"use client"

import { ShopProductCartControls } from "@/components/shop/ShopProductCartControls"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { useCartStore } from "@/store/cartStore"
import type { Product } from "@/types/entityTypeDef"
import { slugify } from "@/lib/portal/slug"
import { getTierPricingLabel, getUnitPriceForQuantity, hasTierDiscount } from "@/lib/shop/pricing"
import { ProductStorageImage } from "@/components/shop/ProductStorageImage"
import { pickPreferredProductImage } from "@/lib/shop/productMedia"
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
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [loadingImage, setLoadingImage] = useState(true)

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

  const detailHref = `/customer/marketplace/${slugify(product.name)}-${product.id}`

  useEffect(() => {
    let cancelled = false
    setLoadingImage(true)
    fetch(`/api/products/images/${product.id}`)
      .then((r) => r.json())
      .then((result) => {
        const items = (result.data ?? []) as {
          image_url: string
          media_type?: string
          is_primary?: boolean
          id: number
        }[]
        const preferred = pickPreferredProductImage(
          items.map((item, index) => ({
            id: item.id ?? index,
            image_url: item.image_url,
            is_primary: Boolean(item.is_primary),
            media_type: item.media_type === "video" ? "video" : "image",
          }))
        )
        if (!cancelled) {
          setImageUrl(preferred?.image_url ?? null)
          setMediaType(preferred?.media_type === "video" ? "video" : "image")
        }
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

    const cartThumb = imageUrl ?? "/logo-colored.png"

    addProduct({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      discount_price: Number(product.discount_price ?? 0),
      discount_min_qty: product.discount_min_qty ?? null,
      quantity: product.stock_quantity,
      image: cartThumb,
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
          mediaType === "video" ? (
            <video
              src={imageUrl}
              muted
              playsInline
              preload="metadata"
              className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <ProductStorageImage
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 260px"
              className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          )
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
        {hasTierDiscount(product) && tierPricingLabel ? (
          <p className="shop-product-card__meta">{tierPricingLabel}</p>
        ) : null}
      </div>
    </article>
  )
}
