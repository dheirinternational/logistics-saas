/** Landing shop copy + shared types for marketing shop UI. */

export const SHOP_TEASER_COPY = {
  eyebrow: "Shop",
  title: "Curated goods, same trusted pipeline",
  subline:
    "Order in your account. We ship with your other packages from China.",
  trustLine:
    "Track everything in your portal, not just WhatsApp updates.",
  seeAll: "See all products",
  featuredTitle: "Featured products",
  categoriesTitle: "Shop by category",
  browseCatalog: "Browse catalog",
  viewCart: "View cart",
  exploreCategory: "Explore category",
} as const

/** Product row from `/api/shop/catalog` featured list. */
export type MarketingShopProduct = {
  id: number
  name: string
  price: number
  discount_price?: number | null
  discount_min_qty?: number | null
  stock_quantity: number
  category_name?: string | null
  image_url?: string | null
}

export type { ShopCatalogItem as MarketingShopCatalogItem } from "@/lib/shop/shopCatalog"
