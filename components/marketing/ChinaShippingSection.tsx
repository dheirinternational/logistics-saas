"use client"

import { IconShip, IconPlane, IconTruck } from "@tabler/icons-react"
import { BlurReveal } from "@/components/auth/BlurReveal"

export function ChinaShippingSection() {
  const shippingMethods = [
    {
      title: "Sea Freight",
      description: "Suitable for larger and heavier commercial shipments where cost efficiency is important.",
      badgeBg: "bg-[#d9f99d]", // Soft lime
      iconColor: "text-slate-900",
      icon: IconShip,
    },
    {
      title: "Air Freight",
      description: "Suitable for customers who need a faster transportation option for eligible goods.",
      badgeBg: "bg-[#e9d5ff]", // Soft purple
      iconColor: "text-slate-900",
      icon: IconPlane,
    },
    {
      title: "Express Shipping",
      description: "Designed for smaller and time-sensitive shipments where speed is a priority.",
      badgeBg: "bg-[#7dd3fc]", // Soft cyan blue
      iconColor: "text-slate-900",
      icon: IconTruck,
    },
  ]

  return (
    <section id="china-shipping" className="marketing-section py-16 md:py-24 bg-[#f0f7ff]">
      <div className="marketing-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Panel: Hub Origin Card matching reference flowchart screenshot */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <BlurReveal delay={0}>
              <span className="text-xs font-bold uppercase tracking-widest text-dheir-blue block mb-2">
                Service 03
              </span>
            </BlurReveal>

            <BlurReveal delay={60}>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                China-to-Nigeria Shipping
              </h2>
            </BlurReveal>

            <BlurReveal delay={120}>
              <p className="mt-4 text-base text-slate-600 leading-relaxed font-medium">
                We coordinate the movement of goods from China to Nigeria through appropriate shipping options depending on the nature, size, urgency, and volume of the shipment.
              </p>
            </BlurReveal>

            <BlurReveal delay={160} className="mt-8">
              <div className="p-6 rounded-2xl bg-white text-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                    LOGISTICS ENGINE
                  </span>
                  <span className="font-display text-lg font-bold text-slate-900">
                    China Warehouse Hub
                  </span>
                </div>
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </BlurReveal>
          </div>

          {/* Middle SVG Tree Connector Lines matching screenshot 2 */}
          <div className="hidden lg:flex lg:col-span-1 justify-center items-center">
            <svg className="w-12 h-64 text-slate-300 stroke-current fill-none" viewBox="0 0 48 256">
              <path d="M0,128 C24,128 24,32 48,32" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0,128 L48,128" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0,128 C24,128 24,224 48,224" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Right Panel: 3 Stacked Floating Shipping Method Cards matching screenshot 1 & 2 */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            {shippingMethods.map((method, idx) => {
              const Icon = method.icon
              return (
                <BlurReveal key={method.title} delay={150 + idx * 80}>
                  <div className="bg-white p-6 sm:p-7 rounded-3xl flex items-center gap-5 transition-transform duration-300 hover:translate-x-1 cursor-pointer">
                    
                    {/* Left Icon Square Avatar Box */}
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0 flex items-center justify-center ${method.badgeBg} ${method.iconColor}`}>
                      <Icon size={28} stroke={2} />
                    </div>

                    {/* Right Shipping Info */}
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                        {method.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                        {method.description}
                      </p>
                    </div>

                  </div>
                </BlurReveal>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  )
}
