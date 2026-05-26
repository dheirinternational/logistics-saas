"use client"

import type { ShopCategory } from "@/lib/marketing/shopCatalog"
import { SHOP_TEASER_COPY } from "@/lib/marketing/shopCatalog"
import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

type ShopCategoryCardProps = {
  category: ShopCategory
}

export function ShopCategoryCard({ category }: ShopCategoryCardProps) {
  return (
    <article className="shop-category-card group">
      <div className="shop-category-card__copy">
        <h3 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
          {category.name}
        </h3>
        <p className="mt-3 text-[14px] leading-[1.55] text-dheir-muted md:text-[15px]">
          {category.description}
        </p>
        <Link
          href="/auth/signup"
          className="shop-category-card__link mt-5 inline-flex items-center gap-1 text-[14px] font-semibold text-dheir-blue no-underline transition-[gap] hover:gap-2"
        >
          {SHOP_TEASER_COPY.exploreCategory}
          <IconArrowRight size={16} stroke={2} aria-hidden />
        </Link>
      </div>
      <div className="shop-category-card__media">
        <Image
          src={category.imageSrc}
          alt={category.imageAlt}
          fill
          sizes="(max-width: 768px) 90vw, 360px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
    </article>
  )
}
