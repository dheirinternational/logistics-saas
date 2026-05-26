"use client"

import type { MarketingShopCategory } from "@/lib/marketing/shopCatalog"
import { SHOP_TEASER_COPY } from "@/lib/marketing/shopCatalog"
import { getCategoryDisplayImage } from "@/lib/portal/shopCategoryImages"
import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

type ShopCategoryCardProps = {
  category: MarketingShopCategory
  href: string
}

export function ShopCategoryCard({ category, href }: ShopCategoryCardProps) {
  const name =
    category.name.charAt(0).toUpperCase() + category.name.slice(1)
  const display = getCategoryDisplayImage(name, category.description ?? undefined)
  const description = category.description?.trim() || display.description

  return (
    <article className="shop-category-card group">
      <div className="shop-category-card__copy">
        <h3 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
          {name}
        </h3>
        <p className="mt-3 text-[14px] leading-[1.55] text-dheir-muted md:text-[15px]">
          {description}
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
          src={display.imageSrc}
          alt={display.imageAlt}
          fill
          sizes="(max-width: 768px) 90vw, 360px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
    </article>
  )
}
