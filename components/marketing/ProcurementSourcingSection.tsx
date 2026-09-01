"use client"

import Image from "next/image"
import { IconCheck } from "@tabler/icons-react"
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
    <section id="procurement-sourcing" className="marketing-section py-12 md:py-20 bg-dheir-page overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Left White Panel: Headline & Overview */}
          <div className="lg:col-span-5 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10">
            <BlurReveal delay={0}>
              <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
                Our Core Services
              </p>
            </BlurReveal>

            <BlurReveal delay={60}>
              <div className="mt-3 flex items-center gap-3">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Procurement & Sourcing
                </h2>
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dheir-blue/10 align-middle">
                  <Image
                    src="/DHEIR colored.png"
                    alt="DHEIR"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                </div>
              </div>
            </BlurReveal>

            <BlurReveal delay={120}>
              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                We simplify purchasing from international markets, taking you beyond just finding a product online to fully understanding and managing what you buy.
              </p>
            </BlurReveal>
          </div>

          {/* Right Dark Green/Navy Panel with Curved Notch Transition */}
          <div className="lg:col-span-7 bg-[#0f2923] text-white p-8 sm:p-12 lg:p-16 relative flex flex-col justify-center">
            
            {/* Replicated Curved Clip-Path Notch matching reference screenshot */}
            <svg
              className="hidden lg:block absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-64 text-[#0f2923] fill-current pointer-events-none z-20"
              viewBox="0 0 48 256"
              preserveAspectRatio="none"
            >
              <path d="M48,0 C48,80 0,96 0,128 C0,160 48,176 48,256 Z" />
            </svg>

            {/* Side-by-Side Services 01 & 02 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-12 relative z-10">
              
              {/* Service 01: Product Sourcing */}
              <BlurReveal delay={150}>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-300/90 block mb-2">
                      Service 01
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white mb-3">
                      Product Sourcing
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed mb-6 font-medium">
                      We help customers identify suitable products and suppliers based on their requirements.
                    </p>

                    {/* Features List */}
                    <div className="space-y-2.5 mb-8">
                      {sourcingFeatures.map((item) => (
                        <div key={item} className="flex items-center gap-3 text-xs sm:text-sm text-slate-100 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-emerald-200/70 pt-4 border-t border-white/10 mt-auto font-normal">
                    We help customers move beyond simply finding a product online to understanding what they are actually purchasing.
                  </p>
                </div>
              </BlurReveal>

              {/* Service 02: Procurement Services */}
              <BlurReveal delay={230}>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-300/90 block mb-2">
                      Service 02
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white mb-3">
                      Procurement Services
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed mb-6 font-medium">
                      Once a product and supplier have been identified, we coordinate the procurement process on behalf of the customer.
                    </p>

                    {/* Features List */}
                    <div className="space-y-2.5 mb-8">
                      {procurementFeatures.map((item) => (
                        <div key={item} className="flex items-center gap-3 text-xs sm:text-sm text-slate-100 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-emerald-200/70 pt-4 border-t border-white/10 mt-auto font-normal">
                    The objective is to make the purchasing process more organized while reducing unnecessary communication barriers with overseas suppliers.
                  </p>
                </div>
              </BlurReveal>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
