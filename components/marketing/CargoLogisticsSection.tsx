"use client"

import Image from "next/image"
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
        <div className="max-w-3xl mb-12 sm:mb-16">
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

        {/* 2x2 Grid of Soft Ice-Teal Rounded Cards with Rich Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Service 04: Cargo Consolidation & Groupage */}
          <BlurReveal delay={150}>
            <div className="flex flex-col justify-between p-6 sm:p-8 md:p-9 rounded-[2rem] sm:rounded-[2.5rem] bg-[#cce3e3] text-slate-900 min-h-[560px] sm:min-h-[600px] group transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
              <div>
                {/* Image Banner */}
                <div className="relative h-52 sm:h-60 w-full overflow-hidden rounded-[1.5rem] mb-6">
                  <Image
                    src="/services/service_consolidation.jpg"
                    alt="Cargo Consolidation & Groupage"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                      Service 04
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight leading-snug">
                  Cargo Consolidation & Groupage
                </h3>

                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-6">
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

              {/* Bottom Service Number & Brand Metadata */}
              <div>
                <div className="h-px bg-slate-900/10 my-6" />
                <div className="flex items-end justify-between">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-700">
                    D_HEIR LOGISTICS
                  </span>
                  <span className="font-display text-5xl sm:text-6xl font-extrabold text-slate-900/90 leading-none">
                    04
                  </span>
                </div>
              </div>
            </div>
          </BlurReveal>

          {/* Service 05: Cargo Handling & Repacking */}
          <BlurReveal delay={230}>
            <div className="flex flex-col justify-between p-6 sm:p-8 md:p-9 rounded-[2rem] sm:rounded-[2.5rem] bg-[#cce3e3] text-slate-900 min-h-[560px] sm:min-h-[600px] group transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
              <div>
                {/* Image Banner */}
                <div className="relative h-52 sm:h-60 w-full overflow-hidden rounded-[1.5rem] mb-6">
                  <Image
                    src="/services/service_handling.jpg"
                    alt="Cargo Handling & Repacking"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                      Service 05
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight leading-snug">
                  Cargo Handling & Repacking
                </h3>

                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-6">
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

              {/* Bottom Service Number & Brand Metadata */}
              <div>
                <div className="h-px bg-slate-900/10 my-6" />
                <div className="flex items-end justify-between">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-700">
                    D_HEIR LOGISTICS
                  </span>
                  <span className="font-display text-5xl sm:text-6xl font-extrabold text-slate-900/90 leading-none">
                    05
                  </span>
                </div>
              </div>
            </div>
          </BlurReveal>

          {/* Service 06: Customs & Clearing Support */}
          <BlurReveal delay={180}>
            <div className="flex flex-col justify-between p-6 sm:p-8 md:p-9 rounded-[2rem] sm:rounded-[2.5rem] bg-[#cce3e3] text-slate-900 min-h-[560px] sm:min-h-[600px] group transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
              <div>
                {/* Image Banner */}
                <div className="relative h-52 sm:h-60 w-full overflow-hidden rounded-[1.5rem] mb-6">
                  <Image
                    src="/services/service_customs.jpg"
                    alt="Customs & Clearing Support"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                      Service 06
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight leading-snug">
                  Customs & Clearing Support
                </h3>

                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-6">
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

              {/* Bottom Service Number & Brand Metadata */}
              <div>
                <div className="h-px bg-slate-900/10 my-6" />
                <div className="flex items-end justify-between">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-700">
                    D_HEIR LOGISTICS
                  </span>
                  <span className="font-display text-5xl sm:text-6xl font-extrabold text-slate-900/90 leading-none">
                    06
                  </span>
                </div>
              </div>
            </div>
          </BlurReveal>

          {/* Service 07: Last-Mile Delivery */}
          <BlurReveal delay={260}>
            <div className="flex flex-col justify-between p-6 sm:p-8 md:p-9 rounded-[2rem] sm:rounded-[2.5rem] bg-[#cce3e3] text-slate-900 min-h-[560px] sm:min-h-[600px] group transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer">
              <div>
                {/* Image Banner */}
                <div className="relative h-52 sm:h-60 w-full overflow-hidden rounded-[1.5rem] mb-6">
                  <Image
                    src="/services/service_lastmile.jpg"
                    alt="Last-Mile Delivery"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                      Service 07
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight leading-snug">
                  Last-Mile Delivery
                </h3>

                <p className="text-sm md:text-[15px] font-medium text-slate-800 leading-relaxed mb-6">
                  Getting cargo into Nigeria is only part of the journey. We coordinate delivery solutions designed to move goods from point of arrival to your final destination.
                </p>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Connected Logistics Journey:</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-900 bg-white/70 p-3.5 rounded-2xl">
                    {journeySteps.map((step, idx) => (
                      <span key={step} className="flex items-center gap-2">
                        <span>{step}</span>
                        {idx < journeySteps.length - 1 && <span className="text-slate-500 font-normal font-sans">&rarr;</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Service Number & Brand Metadata */}
              <div>
                <div className="h-px bg-slate-900/10 my-6" />
                <div className="flex items-end justify-between">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-700">
                    D_HEIR LOGISTICS
                  </span>
                  <span className="font-display text-5xl sm:text-6xl font-extrabold text-slate-900/90 leading-none">
                    07
                  </span>
                </div>
              </div>
            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  )
}

