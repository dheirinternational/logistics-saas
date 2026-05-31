import { getSiteUrl } from "@/lib/marketing/siteMetadata"
import { LEGAL_LINKS } from "@/lib/marketing/siteContact"
import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const now = new Date()

  const legalEntries = LEGAL_LINKS.map((link) => ({
    url: `${siteUrl}${link.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }))

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/auth/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...legalEntries,
  ]
}
