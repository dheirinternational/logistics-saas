"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { NetLift } from "@/components/marketing/NetLift"
import { ShopCategoryCard } from "@/components/marketing/ShopCategoryCard"
import { ShopProductCard } from "@/components/marketing/ShopProductCard"
import {
  SHOP_TEASER_COPY,
  type MarketingShopCategory,
  type MarketingShopProduct,
} from "@/lib/marketing/shopCatalog"
import { slugify } from "@/lib/portal/slug"
import { useCartStore } from "@/store/cartStore"
import Link from "next/link"
import { useEffect, useState } from "react"

type ShopTeaserSectionProps = {
  isAuthenticated?: boolean
}

export function ShopTeaserSection({ isAuthenticated = false }: ShopTeaserSectionProps) {
  const cartCount = useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.amount_to_be_ordered, 0),
  )

  const [featured, setFeatured] = useState<MarketingShopProduct[]>([])
  const [categories, setCategories] = useState<MarketingShopCategory[]>([])
  const [loading, setLoading] = useState(true)

  const shopHref = isAuthenticated ? "/customer/shop" : "/auth/signup"
  const productDetailHref = (product: MarketingShopProduct) =>
    isAuthenticated
      ? `/customer/marketplace/${slugify(product.name)}-${product.id}`
      : "/auth/signup"
  const categoryHref = (category: MarketingShopCategory) =>
    isAuthenticated
      ? `/customer/shop?category=${slugify(category.name)}`
      : "/auth/signup"

  useEffect(() => {
    let cancelled = false

    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((result) => {
        if (cancelled || !result.success) return
        setFeatured(result.data?.featured ?? [])
        setCategories(result.data?.categories ?? [])
      })
      .catch(() => {
        if (!cancelled) {
          setFeatured([])
          setCategories([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      id="shop"
      className="shop-teaser scroll-mt-[5.5rem] bg-dheir-page py-16 md:py-24"
      aria-labelledby="shop-heading"
    >
      <div className="marketing-container">
        <div className="shop-teaser__header">
          <BlurReveal className="max-w-xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-dheir-blue">
              {SHOP_TEASER_COPY.eyebrow}
            </p>
            <h2
              id="shop-heading"
              className="font-display mt-3 text-2xl font-bold tracking-tight text-dheir-ink md:text-[1.75rem]"
            >
              {SHOP_TEASER_COPY.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-dheir-muted md:text-base">
              {SHOP_TEASER_COPY.subline}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-dheir-muted/90">
              {SHOP_TEASER_COPY.trustLine}
            </p>
          </BlurReveal>

          <BlurReveal delay={80} className="shrink-0">
            <Link
              href={shopHref}
              className="shop-teaser__see-all dheir-btn-primary inline-flex min-h-11 w-auto px-5 text-[14px]"
            >
              {SHOP_TEASER_COPY.seeAll}
            </Link>
          </BlurReveal>
        </div>

        <div className="shop-teaser__block mt-14 md:mt-16">
          <BlurReveal>
            <div className="shop-teaser__subheader">
              <h3 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
                {SHOP_TEASER_COPY.featuredTitle}
              </h3>
            </div>
          </BlurReveal>

          <div className="shop-teaser__grid mt-6 md:mt-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <DheirLoader color="var(--color-dheir-blue)" size={12} />
              </div>
            ) : featured.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-dheir-muted">
                No featured products right now.
              </p>
            ) : (
              featured.map((product, index) => (
                <NetLift key={product.id} delay={index * 60}>
                  <ShopProductCard
                    product={product}
                    detailHref={productDetailHref(product)}
                  />
                </NetLift>
              ))
            )}
          </div>
        </div>

        <div className="shop-teaser__block mt-14 md:mt-20">
          <BlurReveal>
            <h3 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
              {SHOP_TEASER_COPY.categoriesTitle}
            </h3>
          </BlurReveal>

          <div className="shop-category-grid mt-6 md:mt-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <DheirLoader color="var(--color-dheir-blue)" size={12} />
              </div>
            ) : categories.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-dheir-muted">
                No categories available.
              </p>
            ) : (
              categories.slice(0, 6).map((category, index) => (
                <NetLift key={category.id} delay={index * 80}>
                  <ShopCategoryCard
                    category={category}
                    href={categoryHref(category)}
                  />
                </NetLift>
              ))
            )}
          </div>
        </div>

        <BlurReveal delay={160}>
          <div className="shop-teaser__actions mt-14 flex flex-col items-center gap-4 sm:mt-16 sm:flex-row sm:justify-center">
            <Link
              href={shopHref}
              className="dheir-btn-primary inline-flex min-h-12 w-full items-center justify-center px-8 sm:w-auto"
            >
              {SHOP_TEASER_COPY.browseCatalog}
            </Link>
            {isAuthenticated && cartCount > 0 ? (
              <Link
                href="/customer/marketplace/cart"
                className="dheir-btn-secondary inline-flex min-h-12 w-full items-center justify-center gap-2 px-8 sm:w-auto"
              >
                {SHOP_TEASER_COPY.viewCart}
                <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-dheir-blue px-1.5 py-0.5 text-xs font-bold text-white tabular-nums">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </Link>
            ) : null}
          </div>
        </BlurReveal>
      </div>
    </section>
  )
}
