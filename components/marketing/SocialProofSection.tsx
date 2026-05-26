"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"
import { DUMMY_REVIEWS, type MarketingReview } from "@/lib/marketing/dummyReviews"
import { IconStarFilled } from "@tabler/icons-react"

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <IconStarFilled
          key={i}
          size={16}
          className={
            i < rating ? "text-dheir-orange" : "text-dheir-muted opacity-25"
          }
          aria-hidden
        />
      ))}
    </div>
  )
}

function ReviewCard({ name, review, rating }: MarketingReview) {
  return (
    <article className="reviews-marquee-card mb-6 flex w-[min(85vw,320px)] shrink-0 flex-col rounded-2xl bg-dheir-surface p-6 shadow-[var(--shadow-dheir-soft)] sm:mb-8 sm:w-[320px] md:p-7">
      <StarRow rating={rating} />
      <blockquote className="mt-5 line-clamp-4 flex-1 text-[15px] leading-[1.6] text-dheir-ink">
        &ldquo;{review}&rdquo;
      </blockquote>
      <footer className="mt-6 border-t border-[var(--color-dheir-border)] pt-4">
        <cite className="font-display text-sm font-semibold not-italic text-dheir-ink">
          {name}
        </cite>
      </footer>
    </article>
  )
}

export function SocialProofSection() {
  const loop = [...DUMMY_REVIEWS, ...DUMMY_REVIEWS]

  return (
    <section
      className="bg-dheir-page py-16 md:py-24"
      aria-labelledby="social-proof-heading"
    >
      <div className="marketing-container">
        <BlurReveal className="text-center">
          <p
            id="social-proof-heading"
            className="font-display text-xl font-bold tracking-tight text-dheir-ink md:text-2xl"
          >
            Trusted by importers
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-dheir-muted md:text-[15px]">
            Real feedback from customers shipping from China to Nigeria.
          </p>
        </BlurReveal>
      </div>

      <div className="reviews-marquee relative mt-12 w-full md:mt-16">
        <div className="reviews-marquee-fade reviews-marquee-fade--left" aria-hidden />
        <div className="reviews-marquee-fade reviews-marquee-fade--right" aria-hidden />

        <div className="reviews-marquee-viewport">
          <div
            className="reviews-marquee-track marketing-scroll-x flex w-max gap-5 px-[max(1rem,env(safe-area-inset-left,0px))] md:gap-6 md:px-[max(1.25rem,env(safe-area-inset-left,0px))]"
            role="list"
          >
            {loop.map((item, index) => (
              <div key={`${item.id}-${index}`} role="listitem">
                <ReviewCard {...item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
