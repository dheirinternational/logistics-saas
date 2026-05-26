"use client"

import { StarRatingInput } from "@/components/ui/StarRatingInput"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import { IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"

type PortalReviewModalProps = {
  open: boolean
  onClose: () => void
}

export function PortalReviewModal({ open, onClose }: PortalReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setRating(5)
    setReview("")
    setSubmitting(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose()
    }
    document.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [open, submitting, onClose])

  if (!open) return null

  const handleSubmit = async () => {
    const text = review.trim()
    if (rating < 1 || rating > 5) {
      toast.error("Choose a star rating")
      return
    }
    if (text.length < 15) {
      toast.error("Review must be at least 15 characters")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: text, rating }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message ?? "Could not submit review")
        return
      }
      toast.success("Thank you for your review")
      onClose()
    } catch {
      toast.error("Could not submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="dheir-dialog-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <div
        className="dheir-dialog portal-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-review-modal-title"
      >
        <div className="dheir-dialog__head">
          <h2 id="portal-review-modal-title" className="dheir-dialog__title">
            Add a review
          </h2>
          <button
            type="button"
            className="dheir-dialog__close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        <div className="dheir-dialog__body portal-review-modal__body">
          <p className="dheir-dialog__text">
            Share your experience with DHEIR. Your review may appear on our website.
          </p>
          <StarRatingInput
            value={rating}
            onChange={setRating}
            disabled={submitting}
          />
          <label className="portal-review-modal__field">
            <span className="portal-packages__field-label">Your review</span>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell others about shipping speed, support, and reliability (min. 15 characters)"
              rows={4}
              disabled={submitting}
              className="portal-packages__textarea"
            />
          </label>
        </div>

        <div className="dheir-dialog__actions">
          <button
            type="button"
            className="dheir-dialog__btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dheir-dialog__btn-primary"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting ? (
              <DheirLoader size="sm" variant="white" />
            ) : (
              "Submit review"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
