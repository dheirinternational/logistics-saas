"use client"

import type { Reviews } from "@/types/entityTypeDef"
import { IconQuote } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export function PortalHomeReviews() {
  const [reviews, setReviews] = useState<Reviews[]>([])
  const [newReview, setNewReview] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const fetchReviews = async () => {
    setIsFetching(true)
    try {
      const res = await fetch("/api/reviews")
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message)
        return
      }
      setReviews(result.data ?? [])
    } catch {
      toast.error("Could not load reviews")
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handlePost = async () => {
    if (newReview.trim().length < 15) {
      toast.error("Review must be at least 15 characters")
      return
    }
    setIsPosting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: newReview.trim() }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setNewReview("")
      setIsOpen(false)
      fetchReviews()
    } catch {
      toast.error("Network error")
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <section className="portal-home__section portal-home__reviews">
      <div className="portal-home__section-head portal-home__reviews-head">
        <div>
          <h2 className="portal-home__section-title">Customer reviews</h2>
          <p className="portal-home__section-sub">
            Share your experience with DHEIR
          </p>
        </div>
        <button
          type="button"
          className="portal-home__btn portal-home__btn--secondary"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? "Cancel" : "Add review"}
        </button>
      </div>

      {isOpen ? (
        <div className="portal-home__review-form">
          <label htmlFor="portal-home-review" className="sr-only">
            Your review
          </label>
          <textarea
            id="portal-home-review"
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Tell others about your experience (min. 15 characters)"
            rows={3}
            className="portal-home__review-input"
          />
          <button
            type="button"
            className="portal-home__btn portal-home__btn--primary"
            onClick={handlePost}
            disabled={isPosting}
          >
            {isPosting ? <BeatLoader size={8} color="#fff" /> : "Submit review"}
          </button>
        </div>
      ) : null}

      <div className="portal-home__review-list">
        {isFetching ? (
          <BeatLoader size={8} color="var(--color-dheir-blue)" />
        ) : reviews.length === 0 ? (
          <p className="portal-home__empty">No reviews yet. Be the first.</p>
        ) : (
          reviews.slice(0, 6).map((review) => (
            <article key={review.id} className="portal-home__review-card">
              <IconQuote
                size={20}
                stroke={1.5}
                className="portal-home__review-quote"
                aria-hidden
              />
              <p className="portal-home__review-text">{review.review}</p>
              <footer className="portal-home__review-meta">
                <span className="portal-home__review-name">{review.name}</span>
                <time dateTime={String(review.created_at)}>
                  {new Date(review.created_at).toLocaleDateString()}
                </time>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
