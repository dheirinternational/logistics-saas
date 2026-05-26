"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"
import {
  AUTH_PANEL_COPY,
  AUTH_PANEL_IMAGE,
  AUTH_PANEL_REVIEW,
} from "@/lib/marketing/authHero"
import { dheirEase } from "@/lib/motion/dheir"
import { IconStarFilled } from "@tabler/icons-react"
import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

type AuthBrandPanelProps = {
  imageSrc?: string
}

export function AuthBrandPanel({
  imageSrc = AUTH_PANEL_IMAGE.src,
}: AuthBrandPanelProps) {
  const reduceMotion = useReducedMotion()

  return (
    <aside className="auth-brand-panel relative hidden min-h-dvh overflow-hidden lg:block">
      <motion.div
        className="absolute inset-0 bg-[#12141a]"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1, transition: { duration: 0.85, ease: dheirEase } }}
        aria-hidden
      >
        <motion.div
          className="relative h-full w-full"
          animate={
            reduceMotion ? undefined : { scale: [1.02, 1.07, 1.02] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 32, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      <div className="auth-brand-panel__scrim absolute inset-0" aria-hidden />

      <div className="auth-brand-panel__content relative z-10 grid min-h-dvh grid-rows-[auto_1fr_auto] px-10 py-10 xl:px-14 xl:py-12">
        <BlurReveal immediate>
          <Link
            href="/"
            className="auth-brand-panel__logo marketing-header-glass inline-flex w-fit items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 no-underline"
          >
            <figure className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/d_heir_logo.png"
                alt=""
                fill
                className="object-contain p-0.5"
                priority
              />
            </figure>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold tracking-tight text-white">
                DHEIR
              </span>
              <span className="text-[11px] font-medium text-white/70">
                International
              </span>
            </span>
          </Link>
        </BlurReveal>

        <div className="flex max-w-md flex-col justify-center py-8">
          <BlurReveal immediate delay={80}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/75">
              {AUTH_PANEL_COPY.eyebrow}
            </p>
            <h2 className="font-display mt-4 text-[clamp(1.65rem,3.2vw,2.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
              {AUTH_PANEL_COPY.headline}
            </h2>
            <p className="mt-4 max-w-[36ch] text-[15px] font-medium leading-[1.55] text-white/85">
              {AUTH_PANEL_COPY.subline}
            </p>
          </BlurReveal>
        </div>

        <BlurReveal immediate delay={160}>
          <figure className="auth-brand-panel__quote m-0 max-w-md">
            <div
              className="flex gap-0.5"
              aria-label={`${AUTH_PANEL_REVIEW.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <IconStarFilled
                  key={i}
                  size={15}
                  className="text-dheir-orange"
                  aria-hidden
                />
              ))}
            </div>
            <blockquote className="mt-4 text-[15px] font-medium leading-[1.6] text-white/92">
              &ldquo;{AUTH_PANEL_REVIEW.review}&rdquo;
            </blockquote>
            <figcaption className="font-display mt-5 text-sm font-semibold text-white not-italic">
              {AUTH_PANEL_REVIEW.name}
            </figcaption>
          </figure>
        </BlurReveal>
      </div>
    </aside>
  )
}
