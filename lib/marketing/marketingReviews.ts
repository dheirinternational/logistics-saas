/** Client-safe review types and marquee helpers (no database imports). */

export type MarketingReview = {
  id: number
  name: string
  review: string
  rating: number
}

/** Duplicate reviews so the marquee scroll has enough width. */
export function reviewsForMarquee(reviews: MarketingReview[]): MarketingReview[] {
  if (reviews.length === 0) return []
  if (reviews.length >= 6) return [...reviews, ...reviews]
  return [...reviews, ...reviews, ...reviews]
}
