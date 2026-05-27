/** DHEIR motion tokens - see VISUAL_IDENTITY.md §8 */

export const dheirEase = [0.22, 1, 0.36, 1] as const

export const blurReveal = {
  hidden: {
    opacity: 0,
    filter: "blur(12px)", 
    y: 8,
  },
  visible: (delaySeconds: number = 0) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.85,
      delay: delaySeconds,
      ease: dheirEase,
    },
  }),
}

export const blurRevealReduced = {
  hidden: { opacity: 0, y: 4 },
  visible: (delaySeconds: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: delaySeconds,
      ease: dheirEase,
    },
  }),
}

export const heroShellIn = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.05,
      ease: dheirEase,
    },
  },
}

export const heroShellInReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35 },
  },
}

export const heroSlideFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 1.4, ease: dheirEase },
}

export const authViewTransition = {
  initial: { opacity: 0, filter: "blur(8px)", y: 6 },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.45, ease: dheirEase },
  },
  exit: {
    opacity: 0,
    filter: "blur(6px)",
    y: -4,
    transition: { duration: 0.3, ease: dheirEase },
  },
}

export const authViewTransitionReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const trustPanelTransition = {
  initial: { opacity: 0, filter: "blur(10px)", y: 14 },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.55, ease: dheirEase },
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
    y: -10,
    transition: { duration: 0.35, ease: dheirEase },
  },
}

export const trustPanelTransitionReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const trustDialIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: dheirEase },
  },
}

export const mobileMenuPanel = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.38,
      ease: dheirEase,
      when: "beforeChildren",
      staggerChildren: 0.045,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
    filter: "blur(4px)",
    transition: { duration: 0.26, ease: dheirEase },
  },
}

export const mobileMenuPanelReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

export const mobileMenuItem = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: dheirEase },
  },
}

export const mobileMenuItemReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
}

export const mobileMenuIcon = {
  initial: { opacity: 0, rotate: -90, scale: 0.85 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 90, scale: 0.85 },
  transition: { duration: 0.22, ease: dheirEase },
}

export const mobileMenuIconReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.12 },
}
