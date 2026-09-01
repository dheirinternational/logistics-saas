"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"

export function GrowthInfrastructureSection() {
  const progressionCards = [
    {
      step: "01",
      initial: "Product",
      result: "Becomes Inventory",
      bgColor: "bg-[#e5e5e3]",
      textColor: "text-slate-900",
      hasGrid: true,
    },
    {
      step: "02",
      initial: "Inventory",
      result: "Becomes Retail Business",
      bgColor: "bg-white",
      textColor: "text-slate-900",
      hasGrid: false,
    },
    {
      step: "03",
      initial: "Reliable Supplier",
      result: "Becomes Supply Chain",
      bgColor: "bg-[#d8f3b5]", // Soft lime sage matching screenshot
      textColor: "text-slate-900",
      hasGrid: false,
    },
    {
      step: "04",
      initial: "Reliable Logistics",
      result: "Becomes Infrastructure",
      bgColor: "bg-[#dbeafe]", // Soft ice blue
      textColor: "text-slate-900",
      hasGrid: false,
    },
  ]

  return (
    <section id="growth-infrastructure" className="marketing-section py-16 md:py-24 bg-[#f4f4f2]">
      <div className="marketing-container">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Infrastructure for Growth
            </p>
          </BlurReveal>

          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-5xl mt-2 tracking-tight">
              For Businesses That Want To Grow
            </h2>
          </BlurReveal>

          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              Importation can be more than buying products. For many entrepreneurs, it is the beginning of a business.
            </p>
          </BlurReveal>
        </div>

        {/* Modular Cards Grid matching screenshot visual style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {progressionCards.map((card, idx) => (
            <BlurReveal key={card.step} delay={140 + idx * 60}>
              <div
                className={`relative flex flex-col justify-between p-8 rounded-3xl h-[340px] md:h-[380px] ${card.bgColor} ${card.textColor} transition-transform duration-300 hover:-translate-y-2 cursor-pointer`}
                style={{
                  backgroundImage: card.hasGrid
                    ? "radial-gradient(#00000015 1px, transparent 1px)"
                    : undefined,
                  backgroundSize: card.hasGrid ? "16px 16px" : undefined,
                }}
              >
                {/* Step Number & Initial Stage */}
                <div>
                  <span className="font-display text-3xl md:text-4xl font-extrabold tracking-tight block mb-2 opacity-85">
                    {card.step}
                  </span>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    {card.initial}
                  </p>
                </div>

                {/* Outcome Statement matching reference typography */}
                <div>
                  <p className="font-display text-2xl md:text-3xl font-extrabold leading-snug tracking-tight text-slate-900">
                    {card.result}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mt-4 pt-4 border-t border-slate-900/10">
                    D_HEIR TRADE ENGINE
                  </p>
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
