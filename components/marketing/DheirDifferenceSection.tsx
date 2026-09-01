"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"

export function DheirDifferenceSection() {
  const journeySteps = [
    "Sourcing",
    "Procurement",
    "Supplier Coordination",
    "Cargo Handling",
    "International Shipping",
    "Customs & Clearing",
    "Delivery",
  ]

  return (
    <section id="dheir-difference" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              The D_HEIR Difference
            </p>
          </BlurReveal>

          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-5xl mt-2 tracking-tight">
              One connected journey. One trusted partner.
            </h2>
          </BlurReveal>

          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              What we promise is to approach the process with clarity, communication, professionalism, and accountability. Because your shipment is not just cargo; it represents your money, your business, and your next opportunity.
            </p>
          </BlurReveal>
        </div>

        {/* 3 Stacked Color Banner Rows with Chamfer Angled Cuts (Replicating Screenshot Design) */}
        <div className="flex flex-col space-y-4 mb-12">
          
          {/* Row 1: Dark Navy/Teal Row */}
          <BlurReveal delay={150}>
            <div
              className="relative bg-[#0a2228] text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-transform duration-300 hover:-translate-y-1"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                <span className="font-display text-6xl md:text-8xl font-extrabold text-white leading-none tracking-tight">
                  01<span className="text-emerald-400">+</span>
                </span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-2">
                    Sourcing & Procurement
                  </h3>
                  <p className="text-sm text-emerald-100/70 max-w-lg leading-relaxed">
                    Supplier research, product identification, price negotiation, and order management from overseas markets.
                  </p>
                </div>
              </div>

              <span className="self-start md:self-center border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200">
                one connected journey
              </span>
            </div>
          </BlurReveal>

          {/* Row 2: Off-White Crisp Row */}
          <BlurReveal delay={220}>
            <div
              className="relative bg-[#f4f6f8] text-[#0a2228] p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-transform duration-300 hover:-translate-y-1"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                <span className="font-display text-6xl md:text-8xl font-extrabold text-[#0a2228] leading-none tracking-tight">
                  04<span className="text-dheir-blue">+</span>
                </span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-[#0a2228] mb-2">
                    Supplier Coordination & Cargo Handling
                  </h3>
                  <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
                    Cargo receiving, consolidation, repacking, CBM calculation, and document verification before dispatch.
                  </p>
                </div>
              </div>

              <span className="self-start md:self-center border border-[#0a2228]/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-700">
                one trusted partner
              </span>
            </div>
          </BlurReveal>

          {/* Row 3: Lime/Chartreuse Accent Row */}
          <BlurReveal delay={290}>
            <div className="relative bg-[#a3e635] text-[#0a2228] p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-transform duration-300 hover:-translate-y-1 rounded-b-3xl">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                <span className="font-display text-6xl md:text-8xl font-extrabold text-[#0a2228] leading-none tracking-tight">
                  07<span className="text-[#0a2228]/70">+</span>
                </span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-[#0a2228] mb-2">
                    International Shipping, Customs & Last-Mile Delivery
                  </h3>
                  <p className="text-sm text-[#0a2228]/80 max-w-lg leading-relaxed">
                    Sea, air, and express shipping options with full customs clearing support and last-mile delivery to your door.
                  </p>
                </div>
              </div>

              <span className="self-start md:self-center border border-[#0a2228]/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#0a2228]">
                supplier to destination
              </span>
            </div>
          </BlurReveal>

        </div>

        {/* 7 Step Connected Journey Flow */}
        <BlurReveal delay={340}>
          <div className="p-6 md:p-8 rounded-2xl bg-dheir-surface">
            <p className="text-xs font-bold uppercase tracking-wider text-dheir-blue mb-4">
              Connected Logistics Journey
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold text-dheir-ink">
              {journeySteps.map((step, idx) => (
                <span key={step} className="flex items-center gap-3">
                  <span className="bg-dheir-page px-3.5 py-2 rounded-xl">{step}</span>
                  {idx < journeySteps.length - 1 && (
                    <span className="text-dheir-blue font-bold text-sm">&rarr;</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </BlurReveal>
      </div>
    </section>
  )
}
