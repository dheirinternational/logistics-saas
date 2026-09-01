import { HeroSection } from "@/components/marketing/HeroSection"
import { AboutUsSection } from "@/components/marketing/AboutUsSection"
import { ProcurementSourcingSection } from "@/components/marketing/ProcurementSourcingSection"
import { ChinaShippingSection } from "@/components/marketing/ChinaShippingSection"
import { CargoLogisticsSection } from "@/components/marketing/CargoLogisticsSection"
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection"
import { BusinessSolutionsSection } from "@/components/marketing/BusinessSolutionsSection"
import { GrowthInfrastructureSection } from "@/components/marketing/GrowthInfrastructureSection"
import { WhyDheirSection } from "@/components/marketing/WhyDheirSection"
import { VisionMissionValuesSection } from "@/components/marketing/VisionMissionValuesSection"
import { DheirDifferenceSection } from "@/components/marketing/DheirDifferenceSection"
import { FAQSection } from "@/components/marketing/FAQSection"
import { ContactUsSection } from "@/components/marketing/ContactUsSection"
import { MarketingFooter } from "@/components/marketing/MarketingFooter"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { getSession } from "@/lib/db/session"
import { toMarketingHeaderUser } from "@/lib/marketing/headerUser"
import {
  buildHomeMetadata,
  buildOrganizationJsonLd,
} from "@/lib/marketing/siteMetadata"
import { PortalWhatsAppFab } from "@/components/portal/home/PortalWhatsAppFab"
import { FloatingVideoWidget } from "@/components/marketing/FloatingVideoWidget"

export const metadata = buildHomeMetadata()

export default async function Home() {
  const session = await getSession()
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
        <AboutUsSection />
        <ProcurementSourcingSection />
        <ChinaShippingSection />
        <CargoLogisticsSection />
        <HowItWorksSection />
        <BusinessSolutionsSection />
        <GrowthInfrastructureSection />
        <WhyDheirSection />
        <VisionMissionValuesSection />
        <DheirDifferenceSection />
        <FAQSection />
        <ContactUsSection />
      </main>
      <MarketingFooter />
      <PortalWhatsAppFab />
      <FloatingVideoWidget />
    </div>
  )
}
