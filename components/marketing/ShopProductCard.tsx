"use client"

import {
  isShopShowcaseProduct,
  type ShopShowcaseProduct,
} from "@/lib/marketing/shopCatalog"
import { useCartStore } from "@/store/cartStore"
import { IconShoppingCartPlus } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { MouseEvent } from "react"
import { toast } from "@/lib/ui/toast"

type ShopProductCardProps = {
  product: ShopShowcaseProduct
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const addProduct = useCartStore((s) => s.addProduct)
  const cart = useCartStore((s) => s.cart)
  const isShowcase = isShopShowcaseProduct(product.id)
  const detailHref = "/auth/signup"

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (cart.some((item) => item.id === product.id)) {
      toast.info("Already in your cart")
      return
    }

    if (isShowcase) {
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        discount_price: 0,
        quantity: 99,
        image: product.imageSrc,
        amount_to_be_ordered: 1,
      })
      toast.success("Added to cart. Sign up to checkout.")
      return
    }

    addProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      discount_price: 0,
      quantity: 99,
      image: product.imageSrc,
      amount_to_be_ordered: 1,
    })
    toast.success("Added to cart")
  }

  return (
    <article className="shop-product-card group">
      <Link href={detailHref} className="shop-product-card__media block">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 260px"
          className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="shop-product-card__body">
        <p className="shop-product-card__category">{product.category}</p>
        <Link href={detailHref} className="shop-product-card__name">
          {product.name}
        </Link>
        <div className="shop-product-card__footer">
          <p className="shop-product-card__price tabular-nums">
            ₦{product.price.toLocaleString()}
          </p>
          <button
            type="button"
            className="shop-product-card__cart-btn"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
          >
            <IconShoppingCartPlus size={20} stroke={1.5} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}
