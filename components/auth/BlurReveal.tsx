"use client"

import { blurReveal, blurRevealReduced } from "@/lib/motion/dheir"
import { motion, useReducedMotion } from "framer-motion"
import type { CSSProperties, ReactNode } from "react"

type BlurRevealProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Stagger delay in milliseconds */
  delay?: number
  /** Animate on mount (auth pages) vs when scrolled into view */
  immediate?: boolean
}

export function BlurReveal({
  children,
  className = "",
  style,
  delay = 0,
  immediate = false,
}: BlurRevealProps) {
  const reduceMotion = useReducedMotion()
  const variants = reduceMotion ? blurRevealReduced : blurReveal
  const delaySeconds = delay / 1000

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate={immediate ? "visible" : undefined}
      whileInView={immediate ? undefined : "visible"}
      viewport={immediate ? undefined : { once: true, amount: 0.15 }}
      variants={variants}
      custom={delaySeconds}
    >
      {children}
    </motion.div>
  )
}

export { authViewTransition, authViewTransitionReduced } from "@/lib/motion/dheir"
