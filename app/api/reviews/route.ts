import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

const MIN_REVIEW_LENGTH = 15

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      )
    }

    const body = await req.json()
    const reviewText =
      typeof body.review === "string" ? body.review.trim() : ""
    const rating = Number(body.rating)

    if (reviewText.length < MIN_REVIEW_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Review must be at least ${MIN_REVIEW_LENGTH} characters`,
        },
        { status: 400 },
      )
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5 stars" },
        { status: 400 },
      )
    }

    const nameRes = await pool.query(
      `
      SELECT first_name, last_name FROM users
      WHERE id = $1
    `,
      [session.user_id],
    )

    const row = nameRes.rows[0]
    const name = [row?.first_name, row?.last_name].filter(Boolean).join(" ").trim()
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Could not resolve your profile name" },
        { status: 400 },
      )
    }

    await pool.query(
      `
      INSERT INTO reviews (review, name, user_id, rating)
      VALUES ($1, $2, $3, $4)
    `,
      [reviewText, name, session.user_id, rating],
    )

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
    })
  } catch (err) {
    console.error("Internal Service Error, could not post review", err)
    const message =
      err instanceof Error && err.message.includes("reviews_rating_check")
        ? "Rating must be between 1 and 5 stars"
        : err instanceof Error && err.message.includes("rating")
          ? "Reviews require a star rating. Run the latest database migration."
          : "Internal Server Error, could not post review"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const reviews = await pool.query(`
      SELECT id, review, name, user_id, rating, created_at
      FROM reviews
      ORDER BY created_at DESC
    `)

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved reviews",
      data: reviews.rows,
    })
  } catch (err) {
    console.error("Internal Server Error, could not get reviews", err)
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error, could not get reviews",
      },
      { status: 500 },
    )
  }
}
