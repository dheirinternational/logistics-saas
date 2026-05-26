"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"
import { MarketingAnchorLink } from "@/components/marketing/MarketingAnchorLink"
import { HERO_COPY, HERO_IMAGE } from "@/lib/marketing/hero"
import { heroShellIn, heroShellInReduced } from "@/lib/motion/dheir"
import { IconArrowRight } from "@tabler/icons-react"
import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const shellVariants = reduceMotion ? heroShellInReduced : heroShellIn

  return (
    <section
      className="marketing-hero relative w-full"
      aria-label="Introduction"
    >
      <motion.div
        className="marketing-hero-polygon relative mx-auto w-full max-w-[100vw] overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={shellVariants}
      >
        <div className="marketing-hero-frame relative min-h-[min(100svh,920px)] w-full">
          <motion.div
            className="absolute inset-0"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.06, 1],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 18,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }
            }
          >
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover marketing-hero-bg"
            />
          </motion.div>

          <div className="marketing-hero-overlay absolute inset-0" aria-hidden />
          <div className="marketing-hero-scrim-bottom absolute inset-0" aria-hidden />

          <div className="relative z-10 flex min-h-[inherit] flex-col justify-center pt-28 pb-[max(clamp(6rem,14vh,10rem),env(safe-area-inset-bottom,0px))] md:pt-32 md:pb-[max(clamp(7rem,16vh,11rem),env(safe-area-inset-bottom,0px))]">
            <div className="marketing-container translate-y-6 md:translate-y-8">
              <div className="max-w-2xl">
                <BlurReveal immediate delay={0}>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/75">
                    {HERO_COPY.eyebrow}
                  </p>
                </BlurReveal>

                <BlurReveal immediate delay={80}>
                  <h1 className="font-display mt-4 text-[clamp(2.25rem,6vw,3.5rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-white">
                    {HERO_COPY.headline}
                  </h1>
                </BlurReveal>

                <BlurReveal immediate delay={160}>
                  <p className="mt-5 max-w-[40ch] text-[17px] font-medium leading-[1.55] text-white/85 md:text-lg">
                    {HERO_COPY.subline}
                  </p>
                </BlurReveal>

                <BlurReveal immediate delay={240}>
                  <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link
                      href="/auth/signup"
                      className="marketing-hero-cta-primary inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-dheir-blue pl-6 pr-2 text-[15px] font-semibold text-white no-underline transition-[background-color,box-shadow,gap] hover:bg-dheir-blue-hover hover:gap-4"
                    >
                      {HERO_COPY.primaryCta}
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
                        aria-hidden
                      >
                        <IconArrowRight size={18} stroke={2} />
                      </span>
                    </Link>
                    <MarketingAnchorLink
                      href="#services"
                      className="marketing-hero-cta-secondary text-[15px] font-semibold text-white no-underline"
                    >
                      {HERO_COPY.secondaryCta}
                    </MarketingAnchorLink>
                  </div>
                </BlurReveal>
              </div>
            </div>
          </div>

          <svg
            className="marketing-hero-bezier absolute bottom-0 left-0 z-10 h-[clamp(3.5rem,8vw,5.5rem)] w-full"
            viewBox="0 0 1440 88"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              fill="var(--color-dheir-page)"
              d="M0,40 C320,88 520,12 720,52 C920,92 1120,28 1440,56 L1440,88 L0,88 Z"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  )
}
