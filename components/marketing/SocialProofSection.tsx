"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"

const REVIEW_IMAGES = [
  "/reviews/kehinde.png",
  "/reviews/dikeh.png",
  "/reviews/goldie.png",
  "/reviews/david.png",
  "/reviews/oluwatoyin.png",
  "/reviews/owoyemi.png",
  "/reviews/rukayat.png",
  "/reviews/lily.png",
  "/reviews/gloria.png",
]

function ImageReviewCard({ src }: { src: string }) {
  return (
    <article className="reviews-marquee-card mb-6 flex shrink-0 items-center justify-center rounded-2xl bg-dheir-surface p-2.5 shadow-[var(--shadow-dheir-soft)] sm:mb-8 md:p-3.5">
      <img
        src={src}
        alt="Customer Review"
        className="h-[120px] sm:h-[130px] w-auto object-contain rounded-xl"
      />
    </article>
  )
}

export function SocialProofSection({ reviews }: { reviews?: any }) {
  // Loop the 10 images 2 times for a total of 20 items in the marquee
  const loop = [...REVIEW_IMAGES, ...REVIEW_IMAGES]

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
        <div
          className="reviews-marquee-fade reviews-marquee-fade--left"
          aria-hidden
        />
        <div
          className="reviews-marquee-fade reviews-marquee-fade--right"
          aria-hidden
        />

        <div className="reviews-marquee-viewport">
          <div
            className="reviews-marquee-track marketing-scroll-x flex w-max gap-5 px-[max(1rem,env(safe-area-inset-left,0px))] md:gap-6 md:px-[max(1.25rem,env(safe-area-inset-left,0px))]"
            role="list"
          >
            {loop.map((src, index) => (
              <div key={`${src}-${index}`} role="listitem">
                <ImageReviewCard src={src} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
