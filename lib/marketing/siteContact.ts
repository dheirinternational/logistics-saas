/** Public contact and social URLs for marketing footer. Update when client confirms. */

export const SITE_CONTACT = {
  email: "support@dheirinternational.com",
  phones: [
    { label: "+18813405374", href: "tel:+18813405374" },
    { label: "+234 816 727 8847", href: "tel:+2348167278847" },
  ],
} as const

export const SITE_SOCIAL = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/",
} as const

export const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Shipping & service conditions", href: "/legal/shipping" },
  { label: "Refund & payment rules", href: "/legal/refunds" },
] as const
