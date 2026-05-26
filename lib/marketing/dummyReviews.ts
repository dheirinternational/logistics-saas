/** Placeholder until live reviews are wired from GET /api/reviews */

export type MarketingReview = {
  id: number
  name: string
  review: string
  rating: number
}

export const DUMMY_REVIEWS: MarketingReview[] = [
  {
    id: 1,
    name: "Ada O.",
    review:
      "I finally know where my packages are. The warehouse address was clear, and my shipment updated without chasing anyone on WhatsApp.",
    rating: 5,
  },
  {
    id: 2,
    name: "Chidi M.",
    review:
      "Sea freight from Guangzhou was straightforward. The CBM quote matched what I paid, and delivery to Lagos was on time.",
    rating: 5,
  },
  {
    id: 3,
    name: "Fatima B.",
    review:
      "Air freight was faster than I expected. Pending payment showed in the app and I paid the same day.",
    rating: 5,
  },
  {
    id: 4,
    name: "Emeka N.",
    review:
      "Consolidation saved me money on three separate Taobao orders. One tracking place for everything.",
    rating: 5,
  },
  {
    id: 5,
    name: "Grace I.",
    review:
      "Customer code on every package meant nothing was lost in the warehouse. Professional from start to finish.",
    rating: 5,
  },
  {
    id: 6,
    name: "Yusuf A.",
    review:
      "Interstate delivery to Kano was handled well. Status updates in the portal were accurate.",
    rating: 5,
  },
]
