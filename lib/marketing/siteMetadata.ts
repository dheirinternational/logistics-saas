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

export const ABOUT_TITLE =
  "About DHEIR International | Procurement, E-commerce, and Logistics"

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

export const OG_IMAGE_ALT =
  "DHEIR International — calm shipping from China to Nigeria with warehouse, air and sea freight"

export function buildOgImageMetadata() {
  const siteUrl = getSiteUrl()

  return {
    url: "/opengraph-image",
    secureUrl: `${siteUrl}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: OG_IMAGE_ALT,
    type: "image/png",
  }
}

export function buildRootMetadata(overrides?: Partial<Metadata>): Metadata {
  const siteUrl = getSiteUrl()
  const ogImage = buildOgImageMetadata()

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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [ogImage.url],
    },
    icons: {
      icon: "/DHEIR colored.png",
      apple: "/DHEIR colored.png",
    },
    ...overrides,
  }
}

export function buildHomeMetadata(): Metadata {
  const siteUrl = getSiteUrl()
  const ogImage = buildOgImageMetadata()

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
      images: [ogImage],
    },
    twitter: {
      title: HOME_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [ogImage.url],
    },
  }
}

export function buildAboutMetadata(): Metadata {
  const siteUrl = getSiteUrl()
  const ogImage = buildOgImageMetadata()
  const aboutDescription =
    "Learn about DHEIR International's procurement, supplier verification, logistics, private label sourcing, and procurement consultation services."

  return {
    title: ABOUT_TITLE,
    description: aboutDescription,
    alternates: {
      canonical: `${siteUrl}/about`,
    },
    openGraph: {
      title: ABOUT_TITLE,
      description: aboutDescription,
      url: `${siteUrl}/about`,
      images: [ogImage],
    },
    twitter: {
      title: ABOUT_TITLE,
      description: aboutDescription,
      images: [ogImage.url],
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
        logo: `${siteUrl}/DHEIR%20colored.png`,
        email: SITE_CONTACT.email,
        telephone: SITE_CONTACT.phones[0].label,
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
