"use client"

import { SHOP_TEASER_COPY } from "@/lib/marketing/shopCatalog"
import type { ShopCatalogItem } from "@/lib/shop/shopCatalog"
import { slugify } from "@/lib/portal/slug"
import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

type ShopCatalogCardProps = {
  item: ShopCatalogItem
  href: string
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80"

export function ShopCatalogCard({ item, href }: ShopCatalogCardProps) {
  const imageSrc = item.image_url?.trim() || FALLBACK_IMAGE
  const imageAlt = item.image_alt?.trim() || item.title

  return (
    <article className="shop-category-card group">
      <div className="shop-category-card__copy">
        <h3 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
          {item.title}
        </h3>
        <p className="mt-3 text-[14px] leading-[1.55] text-dheir-muted md:text-[15px]">
          {item.description}
        </p>
        <Link
          href={href}
          className="shop-category-card__link mt-5 inline-flex items-center gap-1 text-[14px] font-semibold text-dheir-blue no-underline transition-[gap] hover:gap-2"
        >
          {SHOP_TEASER_COPY.exploreCategory}
          <IconArrowRight size={16} stroke={2} aria-hidden />
        </Link>
      </div>
      <div className="shop-category-card__media">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 90vw, 360px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
    </article>
  )
}

export function getShopCatalogHref(
  item: ShopCatalogItem,
  options: { authenticated: boolean }
) {
  if (!options.authenticated) return "/auth/signup"

  if (item.category_name) {
    return `/customer/shop?category=${slugify(item.category_name)}`
  }

  return "/customer/shop"
}
