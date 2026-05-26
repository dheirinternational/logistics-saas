/** Auth split-panel photography (same asset as landing hero until client photos). */

export const AUTH_PANEL_IMAGE = {
  src: "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1600&q=80",
  alt: "",
} as const

/** Center copy on the auth image panel */
export const AUTH_PANEL_COPY = {
  eyebrow: "China to Nigeria · Air & sea",
  headline: "Calm shipping from China home.",
  subline:
    "One place for your warehouse address, packages, and delivery to Nigeria.",
} as const

/** Shown on the auth image panel; swap when live reviews are wired. */
export const AUTH_PANEL_REVIEW = {
  name: "Ada O.",
  review:
    "I finally know where my packages are. The warehouse address was clear, and my shipment updated without chasing anyone on WhatsApp.",
  rating: 5,
} as const
