/** Landing shop showcase — client inventory samples, online placeholder images (not DB). */

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

export type ShopShowcaseProduct = {
  id: number
  name: string
  price: number
  category: string
  imageSrc: string
  imageAlt: string
}

/** IDs 10001+ = landing showcase only (not in database). */
export const SHOP_SHOWCASE_ID_START = 10001

export function isShopShowcaseProduct(id: number) {
  return id >= SHOP_SHOWCASE_ID_START
}

export const SHOP_FEATURED_PRODUCTS: ShopShowcaseProduct[] = [
  {
    id: 10001,
    name: "Bag",
    price: 10000,
    category: "Fashion",
    imageSrc:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Fashion handbag",
  },
  {
    id: 10002,
    name: "Proclean Jugs pink",
    price: 30000,
    category: "Fashion",
    imageSrc:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Pink cleaning jugs",
  },
  {
    id: 10003,
    name: "Vase",
    price: 110000,
    category: "Entertainment",
    imageSrc:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Decorative vase",
  },
  {
    id: 10004,
    name: "Silver Watch",
    price: 122300,
    category: "Fashion",
    imageSrc:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Silver wristwatch",
  },
]

export type ShopCategory = {
  id: string
  name: string
  description: string
  imageSrc: string
  imageAlt: string
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "fashion",
    name: "Fashion",
    description:
      "Bags, watches, and everyday style pieces sourced from China and delivered with your freight.",
    imageSrc:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Fashion bags and accessories",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description:
      "Home decor, vases, and lifestyle goods for spaces that should feel finished.",
    imageSrc:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Decor and entertainment goods",
  },
  {
    id: "home",
    name: "Home essentials",
    description:
      "Cleaning, storage, and household picks like Proclean jugs, bundled into your shipment.",
    imageSrc:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Home and cleaning essentials",
  },
]
