import { HeroSection } from "@/components/marketing/HeroSection"
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection"
import { ServicesSection } from "@/components/marketing/ServicesSection"
import { FAQSection } from "@/components/marketing/FAQSection"
import { ShopTeaserSection } from "@/components/marketing/ShopTeaserSection"
import { TrustSection } from "@/components/marketing/TrustSection"
import { MarketingFooter } from "@/components/marketing/MarketingFooter"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { SocialProofSection } from "@/components/marketing/SocialProofSection"
import { getSession } from "@/lib/db/session"
import { toMarketingHeaderUser } from "@/lib/marketing/headerUser"
import { getMarketingReviews } from "@/lib/marketing/reviews"
import {
  buildHomeMetadata,
  buildOrganizationJsonLd,
} from "@/lib/marketing/siteMetadata"

export const metadata = buildHomeMetadata()

export default async function Home() {
  const [session, reviews] = await Promise.all([
    getSession(),
    getMarketingReviews(),
  ])
  const headerUser = session ? toMarketingHeaderUser(session) : null
  const jsonLd = buildOrganizationJsonLd()

  return (
    <div className="marketing-page min-h-dvh bg-dheir-page font-sans text-dheir-ink antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader user={headerUser} />
      <main id="top" className="relative">
        <HeroSection />
        <SocialProofSection reviews={reviews} />
        <HowItWorksSection />
        <ServicesSection />
        <TrustSection />
        <ShopTeaserSection isAuthenticated={!!session} />
        <FAQSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
