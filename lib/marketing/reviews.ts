import { pool } from "@/lib/db/db"
import type { MarketingReview } from "@/lib/marketing/marketingReviews"

export type { MarketingReview } from "@/lib/marketing/marketingReviews"

const ORIGINAL_REVIEWS: MarketingReview[] = [
  {
    id: 1,
    name: "Kehinde Ifeoluwa",
    review: "My experience with them was awesome. They pay attention to details and you can always trust them with your goods. I got my goods earlier than expected and their service is fast.",
    rating: 5,
  },
  {
    id: 2,
    name: "Dikeh Ndidiamaka Johnson",
    review: "They take accountability for your goods and they are very responsive. I trust and rate them 5 stars.",
    rating: 5,
  },
  {
    id: 3,
    name: "Goldie",
    review: "D_HEIR INTERNATIONAL is that brand you can trust, they made importing from China smooth and easy. They guided me through the shipping process and handled everything professionally.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Antonia",
    review: "It was fast and they are reliable, customer service is top notch.",
    rating: 5,
  },
  {
    id: 5,
    name: "Oluwatoyin",
    review: "D_HEIR International is tested and trusted, and I must commend their swift customer service.",
    rating: 5,
  },
  {
    id: 6,
    name: "Owoyemi Oluwaseun",
    review: "I had an amazing experience with them and I am definitely returning again and again.",
    rating: 5,
  },
  {
    id: 7,
    name: "Rukayat Adio",
    review: "D_HEIR International has a strong reputation for delivering goods safely, protecting valuable cargo, and operating with structure.",
    rating: 5,
  },
  {
    id: 8,
    name: "Lilyyy Emily",
    review: "Very good customer service and prompt delivery coordination.",
    rating: 5,
  },
  {
    id: 9,
    name: "Gloria Nwosu",
    review: "I highly recommend D_HEIR International for cargo logistics and procurement.",
    rating: 5,
  },
]

export async function getMarketingReviews(
  limit = 20,
): Promise<MarketingReview[]> {
  try {
    const dbRes = await pool.query(
      `SELECT id, name, review, rating FROM reviews ORDER BY created_at DESC LIMIT $1`,
      [limit],
    )
    if (dbRes.rows && dbRes.rows.length > 0) {
      const dbReviews: MarketingReview[] = dbRes.rows.map((row: any) => ({
        id: Number(row.id),
        name: String(row.name || "Verified Customer"),
        review: String(row.review || ""),
        rating: Math.min(5, Math.max(1, Number(row.rating || 5))),
      }))

      // Combine DB user reviews first, then fallback reviews, removing duplicate IDs
      const combined = [...dbReviews]
      for (const orig of ORIGINAL_REVIEWS) {
        if (!combined.some((r) => r.review === orig.review)) {
          combined.push(orig)
        }
      }
      return combined.slice(0, limit)
    }
  } catch (err) {
    console.error("Could not fetch DB reviews, falling back to static list", err)
  }

  return ORIGINAL_REVIEWS.slice(0, limit)
}
