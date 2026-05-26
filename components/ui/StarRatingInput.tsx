"use client"

import { IconStar, IconStarFilled } from "@tabler/icons-react"

type StarRatingInputProps = {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
  label?: string
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  label = "Your rating",
}: StarRatingInputProps) {
  return (
    <div className="star-rating-input" role="group" aria-label={label}>
      <p className="star-rating-input__label">{label}</p>
      <div className="star-rating-input__stars">
        {Array.from({ length: 5 }, (_, i) => {
          const star = i + 1
          const filled = star <= value
          const Icon = filled ? IconStarFilled : IconStar
          return (
            <button
              key={star}
              type="button"
              className={`star-rating-input__star${filled ? " is-filled" : ""}`}
              disabled={disabled}
              onClick={() => onChange(star)}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              aria-pressed={filled}
            >
              <Icon size={28} stroke={filled ? 0 : 1.25} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
