"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"
import { NetLift } from "@/components/marketing/NetLift"
import { HOW_IT_WORKS_STEPS } from "@/lib/marketing/howItWorksSteps"
import Image from "next/image"

function StepCard({
  step,
  title,
  description,
  imageSrc,
  imageAlt,
}: (typeof HOW_IT_WORKS_STEPS)[number]) {
  const stepLabel = String(step).padStart(2, "0")

  return (
    <article className="how-it-works-card flex h-[min(80vh,580px)] min-h-[460px] w-[min(82vw,300px)] shrink-0 flex-col overflow-hidden rounded-2xl bg-dheir-surface shadow-[var(--shadow-dheir-soft)] sm:w-[300px] md:h-[560px] md:w-auto">
      <div className="relative mx-4 mt-4 min-h-[260px] flex-[1.6] overflow-hidden rounded-2xl bg-dheir-ink md:min-h-[300px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 86vw, 320px"
          className="object-contain p-3 md:p-4"
        />
        <span className="absolute left-4 top-4 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          {stepLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dheir-blue">
            Step {step}
          </p>
          <h3 className="font-display mt-2 text-lg font-bold leading-snug tracking-tight text-dheir-ink md:text-xl">
            {title}
          </h3>
          <p className="mt-3 text-[14px] leading-[1.55] text-dheir-muted md:text-[15px]">
            {description}
          </p>
        </div>
      </div>
    </article>
  )
}

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="how-it-works-band relative scroll-mt-[5.5rem]"
      aria-labelledby="how-it-works-heading"
    >
      <div className="how-it-works-band__bg w-full py-16 md:py-24">
        <div className="marketing-container">
          <BlurReveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-dheir-blue">
              How it works
            </p>
            <h2
              id="how-it-works-heading"
              className="font-display mt-3 max-w-xl text-2xl font-bold tracking-tight text-dheir-ink md:text-[1.75rem]"
            >
              From China supplier to Nigeria doorstep
            </h2>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-dheir-muted md:text-base">
              Four clear steps. One portal for your address, packages, payments,
              and delivery.
            </p>
          </BlurReveal>
        </div>

        <div className="how-it-works-track-wrap mt-12 md:mt-14">
          <div className="how-it-works-track-inner marketing-container">
            <div className="how-it-works-track marketing-scroll-x flex gap-5 pb-2 md:grid md:grid-cols-4 md:gap-8 md:pb-0">
            {HOW_IT_WORKS_STEPS.map((item, index) => (
              <NetLift key={item.step} delay={index * 60}>
                <StepCard {...item} />
              </NetLift>
            ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
