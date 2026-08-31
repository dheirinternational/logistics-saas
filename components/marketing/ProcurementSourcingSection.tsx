"use client"

import { IconSearch, IconClipboardCheck } from "@tabler/icons-react"
import { BlurReveal } from "@/components/auth/BlurReveal"

export function ProcurementSourcingSection() {
  const sourcingFeatures = [
    "Product identification",
    "Supplier research",
    "Product specification review",
    "Supplier communication",
    "Price comparison",
    "Supplier negotiation",
    "Order coordination",
  ]

  const procurementFeatures = [
    "Supplier communication",
    "Order confirmation",
    "Price negotiation",
    "Payment coordination",
    "Purchase management",
    "Order monitoring",
    "Supplier follow-up",
  ]

  return (
    <section id="procurement-sourcing" className="marketing-section py-16 md:py-24 bg-dheir-surface">
      <div className="marketing-container">
        <div className="max-w-3xl mb-12">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Our Core Services
            </p>
          </BlurReveal>
          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-4xl mt-2">
              Procurement & Sourcing
            </h2>
          </BlurReveal>
          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              We simplify purchasing from international markets, taking you beyond just finding a product online to fully understanding and managing what you buy.
            </p>
          </BlurReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Sourcing */}
          <BlurReveal delay={150}>
            <div className="flex flex-col gap-6 p-8 rounded-2xl bg-dheir-page h-full">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dheir-blue/10 text-dheir-blue">
                  <IconSearch size={24} stroke={1.5} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-dheir-muted">Service 01</span>
                  <h3 className="text-xl font-bold text-dheir-ink">Product Sourcing</h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-dheir-muted">
                We help customers identify suitable products and suppliers based on their requirements.
              </p>
              <ul className="flex flex-col gap-2.5 my-2">
                {sourcingFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-dheir-ink font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-dheir-blue" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs leading-relaxed text-dheir-muted pt-4 border-t border-dheir-border/50 mt-auto">
                We help customers move beyond simply finding a product online to understanding what they are actually purchasing.
              </p>
            </div>
          </BlurReveal>

          {/* Card 2: Procurement */}
          <BlurReveal delay={250}>
            <div className="flex flex-col gap-6 p-8 rounded-2xl bg-dheir-page h-full">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dheir-blue/10 text-dheir-blue">
                  <IconClipboardCheck size={24} stroke={1.5} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-dheir-muted">Service 02</span>
                  <h3 className="text-xl font-bold text-dheir-ink">Procurement Services</h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-dheir-muted">
                Once a product and supplier have been identified, we coordinate the procurement process on behalf of the customer.
              </p>
              <ul className="flex flex-col gap-2.5 my-2">
                {procurementFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-dheir-ink font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-dheir-blue" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs leading-relaxed text-dheir-muted pt-4 border-t border-dheir-border/50 mt-auto">
                The objective is to make the purchasing process more organized while reducing unnecessary communication barriers with overseas suppliers.
              </p>
            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  )
}
