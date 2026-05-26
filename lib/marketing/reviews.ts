import { pool } from "@/lib/db/db"
import type { MarketingReview } from "@/lib/marketing/marketingReviews"

export type { MarketingReview } from "@/lib/marketing/marketingReviews"

export async function getMarketingReviews(
  limit = 12,
): Promise<MarketingReview[]> {
  const result = await pool.query(
    `
    SELECT id, review, name, rating
    FROM reviews
    ORDER BY created_at DESC
    LIMIT $1
  `,
    [limit],
  )

  return result.rows.map((row) => ({
    id: row.id as number,
    name: String(row.name ?? "").trim() || "Customer",
    review: String(row.review ?? "").trim(),
    rating: Math.min(5, Math.max(1, Number(row.rating) || 5)),
  }))
}
