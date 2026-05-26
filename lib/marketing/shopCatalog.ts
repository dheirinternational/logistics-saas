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
  stock_quantity: number
  category_name?: string | null
  image_url?: string | null
}

/** Category row from `/api/shop/catalog`. */
export type MarketingShopCategory = {
  id: number
  name: string
  description?: string | null
  image_url?: string | null
}

/** Fallback category visuals when DB has no custom image. */
export type ShopCategoryVisual = {
  imageSrc: string
  imageAlt: string
  description?: string
}

export const SHOP_CATEGORY_VISUALS: ShopCategoryVisual[] = [
  {
    imageSrc:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Fashion bags and accessories",
    description:
      "Bags, watches, and everyday style pieces sourced from China and delivered with your freight.",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Decor and lifestyle goods",
    description:
      "Home decor, vases, and lifestyle goods for spaces that should feel finished.",
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Home and cleaning essentials",
    description:
      "Cleaning, storage, and household picks bundled into your shipment.",
  },
]
