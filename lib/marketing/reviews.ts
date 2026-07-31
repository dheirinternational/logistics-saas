import type { MarketingReview } from "@/lib/marketing/marketingReviews"

export type { MarketingReview } from "@/lib/marketing/marketingReviews"

const ORIGINAL_REVIEWS: MarketingReview[] = [
  {
    id: 1,
    name: "Kehinde ifeoluwa",
    review: "My experience with them was awesome. Cause they pay attention to details 👌 you can always trust them with your Goods. Less I forget I got my goods earlier than expected there Company is fast ✅",
    rating: 4,
  },
  {
    id: 2,
    name: "Dikeh Ndidiamaka Johnson",
    review: "They take accountability for ur goods and they are very responsive,I trust and rate them 5 five stars.",
    rating: 5,
  },
  {
    id: 3,
    name: "Goldie",
    review: "D_HEIR INTERNATIONAL is that brand you can trust, they made importing from China smooth and easy. They guided me through the shipping process and handled everything professionally. My shipment arrived on time, and I’d recommend them to anyone looking for a reliable logistics partner.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Antonia",
    review: "It was fast and they are reliable,customers service is top notch",
    rating: 5,
  },
]

export async function getMarketingReviews(
  limit = 12,
): Promise<MarketingReview[]> {
  return ORIGINAL_REVIEWS.slice(0, limit)
}
