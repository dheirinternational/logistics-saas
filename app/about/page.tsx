import { MarketingFooter } from "@/components/marketing/MarketingFooter"
import { MarketingHeader } from "@/components/marketing/MarketingHeader"
import { getSession } from "@/lib/db/session"
import { toMarketingHeaderUser } from "@/lib/marketing/headerUser"
import { buildAboutMetadata } from "@/lib/marketing/siteMetadata"

export const metadata = buildAboutMetadata()

const SERVICES = [
  "Product Sourcing",
  "Supplier Verification",
  "Price Negotiation",
  "Quality Control",
  "Cargo Logistics and Shipping",
  "Private Label Sourcing",
  "Procurement Consultation",
] as const

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Household Items",
  "Fashion Accessories",
  "Women's Clothing",
  "Private Label Products",
  "Business and Commercial Supplies",
] as const

export default async function AboutPage() {
  const session = await getSession()
  const headerUser = session ? toMarketingHeaderUser(session) : null

  return (
    <div className="marketing-page min-h-dvh bg-dheir-page font-sans text-dheir-ink antialiased">
      <MarketingHeader user={headerUser} />
      <main className="relative pt-28 pb-20 md:pt-36 md:pb-28">
        <section className="marketing-container">
          <div className="mx-auto max-w-4xl rounded-3xl border border-dheir-border bg-dheir-surface p-6 shadow-[var(--shadow-dheir-soft)] md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dheir-blue">
              Company Overview
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-dheir-ink md:text-4xl">
              D_HEIR International
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-dheir-muted md:text-base">
              D_HEIR International is a Procurement, E-commerce, and Logistics Company
              dedicated to helping individuals, businesses, and organizations source
              quality products directly from trusted suppliers and manufacturers in China.
            </p>

            <section className="mt-10">
              <h2 className="font-display text-xl font-bold tracking-tight text-dheir-ink md:text-2xl">
                Our services include
              </h2>
              <ul className="mt-4 grid gap-2 text-[15px] leading-relaxed text-dheir-muted md:grid-cols-2">
                {SERVICES.map((service) => (
                  <li key={service} className="rounded-xl bg-dheir-page px-4 py-3">
                    {service}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[15px] leading-relaxed text-dheir-muted md:text-base">
                Through our extensive supplier network and procurement expertise, we provide
                our clients with access to high-quality products at competitive prices,
                enabling them to maximize profitability, achieve cost efficiency, and
                expand their businesses.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-xl font-bold tracking-tight text-dheir-ink md:text-2xl">
                Products we specialize in sourcing
              </h2>
              <ul className="mt-4 grid gap-2 text-[15px] leading-relaxed text-dheir-muted md:grid-cols-2">
                {PRODUCT_CATEGORIES.map((category) => (
                  <li key={category} className="rounded-xl bg-dheir-page px-4 py-3">
                    {category}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10 rounded-2xl border border-dheir-border bg-dheir-page p-5 md:p-6">
              <h2 className="font-display text-xl font-bold tracking-tight text-dheir-ink md:text-2xl">
                Disclaimer
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-dheir-muted md:text-base">
                <p>
                  D_HEIR International is a procurement and logistics company and is not
                  the manufacturer, owner, or producer of the products displayed on our
                  website, social media platforms, Telegram channels, marketing materials,
                  or any other communication platforms.
                </p>
                <p>
                  All product images, descriptions, specifications, and related content
                  are provided by the respective manufacturers, suppliers, or product
                  owners. D_HEIR International does not claim ownership of such materials
                  and uses them solely for sourcing, procurement, marketing, and customer
                  information purposes.
                </p>
                <p>
                  Our role is to connect customers with reliable suppliers, facilitate
                  procurement processes, coordinate logistics, and assist in delivering
                  products efficiently to our clients.
                </p>
                <p>
                  We remain committed to transparency, professionalism, and providing
                  exceptional procurement and logistics solutions to our valued customers.
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
