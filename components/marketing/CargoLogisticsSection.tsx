"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"

export function CargoLogisticsSection() {
  const consolidationAudience = [
    "Small and medium-sized businesses",
    "New importers",
    "Retailers & online sellers",
    "Customers testing new products",
    "Customers with smaller cargo volumes",
  ]

  const handlingActivities = [
    "Cargo receiving",
    "Shipment identification",
    "Cargo consolidation",
    "Repacking & protection",
    "Measurement & CBM calculation",
    "Shipment documentation & dispatch",
  ]

  const clearingSupport = [
    "Customs-related coordination",
    "Clearing arrangements",
    "Cargo documentation",
    "Port-related logistics",
    "Delivery coordination",
  ]

  const journeySteps = ["Supplier", "China Warehouse", "Shipping", "Nigeria", "Customer"]

  return (
    <section id="cargo-logistics" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              D_HEIR Cargo & Logistics
            </p>
          </BlurReveal>

          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-5xl mt-2 tracking-tight">
              Your cargo. Our coordination.
            </h2>
          </BlurReveal>

          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              D_HEIR CARGO & LOGISTICS is the logistics arm of D_HEIR INTERNATIONAL, focused on the movement and coordination of goods from China to Nigeria.
            </p>
          </BlurReveal>
        </div>

        {/* 2x2 Grid of Soft Ice-Teal Rounded Cards (Matching Reference Screenshot) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service 04: Cargo Consolidation & Groupage */}
          <BlurReveal delay={150}>
            <div className="flex flex-col justify-between p-8 md:p-10 rounded-[2.5rem] bg-[#cce3e3] text-slate-900 min-h-[540px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] cursor-pointer">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 bg-white/60 px-3 py-1 rounded-full inline-block mb-6">
                  Service 04
                </span>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-snug">
                  Cargo Consolidation & Groupage
                </h3>

                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-8">
                  Customers with smaller shipments do not always need to book an entire container. Our consolidation approach allows compatible shipments to be grouped together, helping customers access international shipping without carrying the cost of a full container.
                </p>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Particularly useful for:</p>
                  <div className="flex flex-wrap gap-2">
                    {consolidationAudience.map((item) => (
                      <span key={item} className="text-xs font-semibold text-slate-900 bg-white/70 px-3 py-1.5 rounded-xl">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Giant Service Number & Brand Metadata */}
              <div className="flex items-end justify-between border-t border-slate-900/15 pt-6 mt-8">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  D_HEIR LOGISTICS
                </span>
                <span className="font-display text-6xl md:text-7xl font-extrabold text-slate-900/90 leading-none">
                  04
                </span>
              </div>
            </div>
          </BlurReveal>

          {/* Service 05: Cargo Handling & Repacking */}
          <BlurReveal delay={230}>
            <div className="flex flex-col justify-between p-8 md:p-10 rounded-[2.5rem] bg-[#cce3e3] text-slate-900 min-h-[540px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] cursor-pointer">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 bg-white/60 px-3 py-1 rounded-full inline-block mb-6">
                  Service 05
                </span>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-snug">
                  Cargo Handling & Repacking
                </h3>

                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-8">
                  Proper cargo preparation makes a significant difference in international logistics. We ensure goods are properly inspected, measured, and protected before they begin their journey to Nigeria.
                </p>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Activities covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {handlingActivities.map((item) => (
                      <span key={item} className="text-xs font-semibold text-slate-900 bg-white/70 px-3 py-1.5 rounded-xl">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Giant Service Number & Brand Metadata */}
              <div className="flex items-end justify-between border-t border-slate-900/15 pt-6 mt-8">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  D_HEIR LOGISTICS
                </span>
                <span className="font-display text-6xl md:text-7xl font-extrabold text-slate-900/90 leading-none">
                  05
                </span>
              </div>
            </div>
          </BlurReveal>

          {/* Service 06: Customs & Clearing Support */}
          <BlurReveal delay={180}>
            <div className="flex flex-col justify-between p-8 md:p-10 rounded-[2.5rem] bg-[#cce3e3] text-slate-900 min-h-[540px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] cursor-pointer">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 bg-white/60 px-3 py-1 rounded-full inline-block mb-6">
                  Service 06
                </span>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-snug">
                  Customs & Clearing Support
                </h3>

                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-8">
                  We coordinate with relevant logistics and clearing partners to facilitate the movement of cargo through customs and port-related logistics in Nigeria.
                </p>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Support items:</p>
                  <div className="flex flex-wrap gap-2">
                    {clearingSupport.map((item) => (
                      <span key={item} className="text-xs font-semibold text-slate-900 bg-white/70 px-3 py-1.5 rounded-xl">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Giant Service Number & Brand Metadata */}
              <div className="flex items-end justify-between border-t border-slate-900/15 pt-6 mt-8">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  D_HEIR LOGISTICS
                </span>
                <span className="font-display text-6xl md:text-7xl font-extrabold text-slate-900/90 leading-none">
                  06
                </span>
              </div>
            </div>
          </BlurReveal>

          {/* Service 07: Last-Mile Delivery */}
          <BlurReveal delay={260}>
            <div className="flex flex-col justify-between p-8 md:p-10 rounded-[2.5rem] bg-[#cce3e3] text-slate-900 min-h-[540px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] cursor-pointer">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 bg-white/60 px-3 py-1 rounded-full inline-block mb-6">
                  Service 07
                </span>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-snug">
                  Last-Mile Delivery
                </h3>

                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-8">
                  Getting cargo into Nigeria is only part of the journey. We coordinate delivery solutions designed to move goods from point of arrival to your final destination.
                </p>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Connected Logistics Journey:</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-900 bg-white/70 p-3.5 rounded-2xl">
                    {journeySteps.map((step, idx) => (
                      <span key={step} className="flex items-center gap-2">
                        <span>{step}</span>
                        {idx < journeySteps.length - 1 && <span className="text-slate-500 font-normal">&rarr;</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Giant Service Number & Brand Metadata */}
              <div className="flex items-end justify-between border-t border-slate-900/15 pt-6 mt-8">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  D_HEIR LOGISTICS
                </span>
                <span className="font-display text-6xl md:text-7xl font-extrabold text-slate-900/90 leading-none">
                  07
                </span>
              </div>
            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  )
}
