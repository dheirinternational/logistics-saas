"use client"

import { PortalShopCategoryCard } from "@/components/portal/shop/PortalShopCategoryCard"
import { PortalShopProductCard } from "@/components/portal/shop/PortalShopProductCard"
import { SHOP_TEASER_COPY } from "@/lib/marketing/shopCatalog"
import type { Product, ProductCategory } from "@/types/entityTypeDef"
import { useCartStore } from "@/store/cartStore"
import { IconSearch } from "@tabler/icons-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

export function PortalShopPage() {
  const searchParams = useSearchParams()
  const cartCount = useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.amount_to_be_ordered, 0),
  )

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")

  useEffect(() => {
    const q = searchParams.get("search")?.trim() ?? ""
    const cat = searchParams.get("category")?.trim() ?? ""
    setSearch(q)
    setCategoryId(cat)
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/products/categories").then((r) => r.json()),
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes.data) setProducts(prodRes.data)
        if (catRes.data) setCategories(catRes.data)
      })
      .catch(() => toast.error("Could not load shop"))
      .finally(() => setLoading(false))
  }, [])

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of categories) {
      map.set(c.id, c.name.charAt(0).toUpperCase() + c.name.slice(1))
    }
    return map
  }, [categories])

  const featured = useMemo(
    () => products.filter((p) => p.is_featured),
    [products],
  )

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q || p.name.toLowerCase().includes(q)
      const matchesCategory =
        !categoryId || String(p.category_id) === categoryId
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryId])

  const activeCategoryName = categoryId
    ? categoryNameById.get(Number(categoryId))
    : null

  return (
    <section className="portal-shop shop-teaser" aria-labelledby="portal-shop-heading">
        <div className="shop-teaser__header">
          <div className="max-w-xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-dheir-blue">
              {SHOP_TEASER_COPY.eyebrow}
            </p>
            <h1
              id="portal-shop-heading"
              className="font-display mt-3 text-2xl font-bold tracking-tight text-dheir-ink md:text-[1.75rem]"
            >
              {SHOP_TEASER_COPY.title}
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-dheir-muted md:text-base">
              {SHOP_TEASER_COPY.subline}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-dheir-muted/90">
              {SHOP_TEASER_COPY.trustLine}
            </p>
          </div>

          <div className="portal-shop__search shrink-0">
            <IconSearch size={18} stroke={1.5} className="portal-shop__search-icon" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="portal-shop__search-input"
            />
          </div>
        </div>

        {activeCategoryName ? (
          <p className="portal-shop__filter-banner mt-8">
            Showing <strong>{activeCategoryName}</strong>
            <button
              type="button"
              className="portal-shop__filter-clear"
              onClick={() => setCategoryId("")}
            >
              Clear
            </button>
          </p>
        ) : null}

        <div className="shop-teaser__block mt-14 md:mt-16">
          <div className="shop-teaser__subheader">
            <h2 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
              {SHOP_TEASER_COPY.featuredTitle}
            </h2>
          </div>

          <div className="shop-teaser__grid mt-6 md:mt-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <DheirLoader color="var(--color-dheir-blue)" size={12} />
              </div>
            ) : featured.length === 0 ? (
              <p className="col-span-full text-center text-sm text-dheir-muted py-8">
                No featured products right now.
              </p>
            ) : (
              featured.map((product) => (
                <PortalShopProductCard
                  key={product.id}
                  product={product}
                  categoryLabel={
                    categoryNameById.get(product.category_id) ?? "Shop"
                  }
                />
              ))
            )}
          </div>
        </div>

        <div className="shop-teaser__block mt-14 md:mt-20">
          <h2 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
            {SHOP_TEASER_COPY.categoriesTitle}
          </h2>

          <div className="shop-category-grid mt-6 md:mt-8">
            {categories.map((category) => (
              <PortalShopCategoryCard
                key={category.id}
                id={category.id}
                name={
                  category.name.charAt(0).toUpperCase() + category.name.slice(1)
                }
                description={category.description}
              />
            ))}
          </div>
        </div>

        <div className="shop-teaser__block mt-14 md:mt-20">
          <div className="shop-teaser__subheader">
            <h2 className="font-display text-lg font-bold tracking-tight text-dheir-ink md:text-xl">
              All products
            </h2>
          </div>

          {categories.length > 0 ? (
            <div className="portal-shop__category-chips mt-6">
              <button
                type="button"
                className={`portal-shop__chip${!categoryId ? " is-active" : ""}`}
                onClick={() => setCategoryId("")}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`portal-shop__chip${categoryId === String(c.id) ? " is-active" : ""}`}
                  onClick={() => setCategoryId(String(c.id))}
                >
                  {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                </button>
              ))}
            </div>
          ) : null}

          <div className="shop-teaser__grid mt-6 md:mt-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <DheirLoader color="var(--color-dheir-blue)" size={12} />
              </div>
            ) : filtered.length === 0 ? (
              <p className="col-span-full text-center text-sm text-dheir-muted py-8">
                No products match your filters.
              </p>
            ) : (
              filtered.map((product) => (
                <PortalShopProductCard
                  key={product.id}
                  product={product}
                  categoryLabel={
                    categoryNameById.get(product.category_id) ?? "Shop"
                  }
                />
              ))
            )}
          </div>
        </div>

        <div className="shop-teaser__actions mt-14 flex flex-col items-center gap-4 sm:mt-16 sm:flex-row sm:justify-center">
          <Link
            href="/base/marketplace/cart"
            className="dheir-btn-primary inline-flex min-h-12 w-full items-center justify-center px-8 sm:w-auto"
          >
            {cartCount > 0 ? SHOP_TEASER_COPY.viewCart : SHOP_TEASER_COPY.browseCatalog}
          </Link>
        </div>
    </section>
  )
}
