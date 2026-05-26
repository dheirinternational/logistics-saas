"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"
import { MarketingAnchorLink } from "@/components/marketing/MarketingAnchorLink"
import { NetLift } from "@/components/marketing/NetLift"
import { TRUST_DIAL_TICKS } from "@/lib/marketing/trustDialTicks"
import { TRUST_HEADLINE, TRUST_ITEMS } from "@/lib/marketing/trustItems"
import {
  trustDialIn,
  trustPanelTransition,
  trustPanelTransitionReduced,
} from "@/lib/motion/dheir"
import { IconChevronDown } from "@tabler/icons-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

export function TrustSection() {
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [pointerTop, setPointerTop] = useState(0)
  const [pointerReady, setPointerReady] = useState(false)
  const layoutRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const active = TRUST_ITEMS[activeIndex]
  const progress = ((activeIndex + 1) / TRUST_ITEMS.length) * 100
  const panelMotion = reduceMotion
    ? trustPanelTransitionReduced
    : trustPanelTransition

  const syncPointer = useCallback(() => {
    const layout = layoutRef.current
    const btn = itemRefs.current[activeIndex]
    if (!layout || !btn) return
    const layoutRect = layout.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setPointerTop(btnRect.top - layoutRect.top + btnRect.height / 2)
    setPointerReady(true)
  }, [activeIndex])

  useLayoutEffect(() => {
    syncPointer()
    window.addEventListener("resize", syncPointer)
    return () => window.removeEventListener("resize", syncPointer)
  }, [syncPointer])

  return (
    <section
      id="trust"
      className="trust-section scroll-mt-[5.5rem] bg-dheir-page py-16 md:py-24"
      aria-labelledby="trust-heading"
    >
      <div className="marketing-container">
        <div ref={layoutRef} className="trust-layout">
          <ul
            className="trust-nav marketing-scroll-x"
            role="tablist"
            aria-label="Trust topics"
          >
            {TRUST_ITEMS.map((item, index) => {
              const isActive = index === activeIndex
              return (
                <li key={item.id} role="presentation">
                  <NetLift delay={index * 55}>
                    <button
                      ref={(el) => {
                        itemRefs.current[index] = el
                      }}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="trust-panel"
                      id={`trust-tab-${item.id}`}
                      className={`trust-nav__item ${isActive ? "is-active" : ""}`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className="trust-nav__thumb">
                        <Image
                          src={item.imageSrc}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span className="trust-nav__label">{item.label}</span>
                    </button>
                  </NetLift>
                </li>
              )
            })}
          </ul>

          <span
            className={`trust-pointer hidden lg:block ${pointerReady ? "is-visible" : ""}`}
            style={{ top: pointerTop }}
            aria-hidden
          />

          <div className="trust-stage">
            <div className="trust-dial-wrap" aria-hidden>
              <motion.div
                className="flex h-full w-full items-center justify-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={reduceMotion ? { hidden: {}, visible: {} } : trustDialIn}
              >
                <svg
                  className="trust-dial"
                  viewBox="0 0 420 420"
                  fill="none"
                >
                  {TRUST_DIAL_TICKS.map((tick, i) => (
                    <line
                      key={i}
                      x1={tick.x1}
                      y1={tick.y1}
                      x2={tick.x2}
                      y2={tick.y2}
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity={tick.major ? 0.35 : 0.18}
                    />
                  ))}
                  <circle
                    cx="210"
                    cy="210"
                    r="200"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.08"
                  />
                </svg>
              </motion.div>
            </div>

            <div className="trust-stage__content">
              <BlurReveal delay={0}>
                <p className="trust-badge">{TRUST_HEADLINE.badge}</p>
              </BlurReveal>
              <BlurReveal delay={80}>
                <h2
                  id="trust-heading"
                  className="trust-headline font-display"
                >
                  {TRUST_HEADLINE.before}{" "}
                  <span className="text-dheir-blue">
                    {TRUST_HEADLINE.highlight}
                  </span>
                </h2>
              </BlurReveal>

              <BlurReveal delay={160} className="trust-card-wrap w-full">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active.id}
                    id="trust-panel"
                    role="tabpanel"
                    aria-labelledby={`trust-tab-${active.id}`}
                    className="trust-card"
                    {...panelMotion}
                  >
                    <div className="trust-card__header">
                      <span className="trust-card__thumb">
                        <Image
                          src={active.imageSrc}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </span>
                      <span className="font-display text-base font-bold text-dheir-ink md:text-lg">
                        {active.title}
                      </span>
                    </div>
                    <p className="trust-card__body">{active.description}</p>
                    <MarketingAnchorLink href="#services" className="trust-card__cta">
                      Explore services
                      <IconChevronDown size={16} stroke={2} aria-hidden />
                    </MarketingAnchorLink>
                  </motion.div>
                </AnimatePresence>
              </BlurReveal>

              <BlurReveal delay={240}>
                <div
                  className="trust-progress"
                  role="progressbar"
                  aria-valuenow={activeIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={TRUST_ITEMS.length}
                  aria-label="Topic progress"
                >
                  <motion.span
                    className="trust-progress__fill"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </BlurReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
