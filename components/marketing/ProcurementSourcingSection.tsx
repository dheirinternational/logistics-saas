"use client"

import Image from "next/image"
import { IconSearch, IconClipboardCheck, IconCheck } from "@tabler/icons-react"
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
    <section id="procurement-sourcing" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        {/* Top Line Separator matching reference design */}
        <div className="border-t border-dheir-border/60 pt-10 md:pt-14 mb-12">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Our Core Services
            </p>
          </BlurReveal>

          <BlurReveal delay={60}>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-5xl tracking-tight">
                Procurement & Sourcing
              </h2>
              <div className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-dheir-blue/10 align-middle">
                <Image
                  src="/DHEIR colored.png"
                  alt="DHEIR"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </div>
            </div>
          </BlurReveal>

          <BlurReveal delay={120}>
            <p className="mt-4 max-w-2xl text-base text-dheir-muted leading-relaxed">
              We simplify purchasing from international markets, taking you beyond just finding a product online to fully understanding and managing what you buy.
            </p>
          </BlurReveal>
        </div>

        {/* Card Grid Inspired by Screenshot (Solid Tinted Large Rounded Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service 01: Product Sourcing */}
          <BlurReveal delay={150}>
            <div className="flex flex-col justify-between p-8 md:p-10 rounded-[2.25rem] bg-[#eff6ff] text-dheir-ink min-h-[520px] transition-transform duration-300 hover:-translate-y-1">
              <div>
                {/* Top Left Icon & Number */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-dheir-blue">
                    <IconSearch size={24} stroke={2} />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-dheir-blue/80 bg-white/80 px-3 py-1 rounded-full">
                    Service 01
                  </span>
                </div>

                {/* Large Title & Subtitle */}
                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-dheir-ink mt-8 mb-3 tracking-tight">
                  Product Sourcing
                </h3>
                <p className="text-sm md:text-[15px] font-medium leading-relaxed text-dheir-muted mb-8">
                  We help customers identify suitable products and suppliers based on their requirements.
                </p>

                {/* Feature Checklist */}
                <div className="space-y-3 mb-8">
                  {sourcingFeatures.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm font-semibold text-dheir-ink">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dheir-blue text-white">
                        <IconCheck size={12} stroke={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Summary Note */}
              <div className="pt-6 border-t border-dheir-blue/15">
                <p className="text-xs md:text-sm font-medium leading-relaxed text-dheir-muted">
                  We help customers move beyond simply finding a product online to understanding what they are actually purchasing.
                </p>
              </div>
            </div>
          </BlurReveal>

          {/* Service 02: Procurement Services */}
          <BlurReveal delay={250}>
            <div className="flex flex-col justify-between p-8 md:p-10 rounded-[2.25rem] bg-[#f8fafc] text-dheir-ink min-h-[520px] transition-transform duration-300 hover:-translate-y-1">
              <div>
                {/* Top Left Icon & Number */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-dheir-blue">
                    <IconClipboardCheck size={24} stroke={2} />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-dheir-blue/80 bg-white/80 px-3 py-1 rounded-full">
                    Service 02
                  </span>
                </div>

                {/* Large Title & Subtitle */}
                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-dheir-ink mt-8 mb-3 tracking-tight">
                  Procurement Services
                </h3>
                <p className="text-sm md:text-[15px] font-medium leading-relaxed text-dheir-muted mb-8">
                  Once a product and supplier have been identified, we coordinate the procurement process on behalf of the customer.
                </p>

                {/* Feature Checklist */}
                <div className="space-y-3 mb-8">
                  {procurementFeatures.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm font-semibold text-dheir-ink">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dheir-blue text-white">
                        <IconCheck size={12} stroke={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Summary Note */}
              <div className="pt-6 border-t border-dheir-border/60">
                <p className="text-xs md:text-sm font-medium leading-relaxed text-dheir-muted">
                  The objective is to make the purchasing process more organized while reducing unnecessary communication barriers with overseas suppliers.
                </p>
              </div>
            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  )
}
