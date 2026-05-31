import type { Metadata } from "next"
import { HERO_COPY } from "@/lib/marketing/hero"
import { SITE_CONTACT } from "@/lib/marketing/siteContact"

export const SITE_NAME = "DHEIR International"

export const SITE_DOMAIN = "dheirinternational.com"

export function getSiteUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BASE_URL?.trim() ||
    ""

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "")
  }

  return "https://www.dheirinternational.com"
}

export const DEFAULT_TITLE =
  "DHEIR International | China to Nigeria Shipping & Logistics"

export const HOME_TITLE =
  "China to Nigeria Shipping | Warehouse, Air & Sea Freight | DHEIR International"

export const DEFAULT_DESCRIPTION =
  "Ship from China to Nigeria with one portal for your China warehouse address, package consolidation, air and sea freight, customs support, and delivery. Trusted by importers across Nigeria."

export const SEO_KEYWORDS = [
  "China to Nigeria shipping",
  "China to Nigeria logistics",
  "freight forwarding Nigeria",
  "import from China to Nigeria",
  "China warehouse address",
  "1688 shipping Nigeria",
  "Taobao shipping Nigeria",
  "air freight China Nigeria",
  "sea freight China Nigeria",
  "consolidation shipping China",
  "CBM shipping Nigeria",
  "DHEIR International",
  "dheirinternational",
  "logistics company Nigeria",
  "cargo shipping Nigeria",
  "buy from China Nigeria",
  "China sourcing Nigeria",
  "Onitsha shipping",
  "Kano freight",
  "Lagos China shipping",
] as const

export const OG_EYEBROW = HERO_COPY.eyebrow
export const OG_HEADLINE = HERO_COPY.headline
export const OG_SUBLINE = HERO_COPY.subline

export function buildRootMetadata(overrides?: Partial<Metadata>): Metadata {
  const siteUrl = getSiteUrl()

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Logistics",
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_NG",
      url: siteUrl,
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
    icons: {
      icon: "/Dheir colored.png",
      apple: "/Dheir colored.png",
    },
    ...overrides,
  }
}

export function buildHomeMetadata(): Metadata {
  const siteUrl = getSiteUrl()

  return {
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: HOME_TITLE,
      description: DEFAULT_DESCRIPTION,
      url: siteUrl,
    },
    twitter: {
      title: HOME_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
  }
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl()

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        logo: `${siteUrl}/Dheir%20colored.png`,
        email: SITE_CONTACT.email,
        telephone: SITE_CONTACT.phone,
        areaServed: ["NG", "CN"],
        description: DEFAULT_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-NG",
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: HOME_TITLE,
        description: DEFAULT_DESCRIPTION,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-NG",
      },
    ],
  }
}
