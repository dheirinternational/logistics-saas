"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"

export function CoreValuesSection() {
  const values = [
    {
      title: "Integrity",
      description: "We believe trust is the foundation of every successful business relationship.",
      cardBg: "bg-white",
      textColor: "text-slate-900",
    },
    {
      title: "Transparency",
      description: "We communicate clearly about services, processes, costs, and expectations.",
      cardBg: "bg-[#86efac]",
      textColor: "text-slate-900",
    },
    {
      title: "Reliability",
      description: "We understand that customers are trusting us with their money, products, and business plans.",
      cardBg: "bg-[#10b981]",
      textColor: "text-white",
    },
    {
      title: "Professionalism",
      description: "Every shipment and customer interaction should be handled with structure and accountability.",
      cardBg: "bg-[#047857]",
      textColor: "text-white",
    },
    {
      title: "Continuous Improvement",
      description: "We continue to improve our processes, partnerships, and customer experience as international trade evolves.",
      cardBg: "bg-[#064e3b]",
      textColor: "text-white",
    },
  ]

  return (
    <section id="core-values" className="marketing-section py-16 md:py-24 bg-[#d7f4db] text-[#064e3b]">
      <div className="marketing-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Panel: Headline & Year Tag matching reference screenshot */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full py-4">
            <div>
              <BlurReveal delay={0}>
                <span className="text-xs font-bold uppercase tracking-widest text-[#047857] block mb-12">
                  D_HEIR VALUES
                </span>
              </BlurReveal>

              <BlurReveal delay={60}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#047857] mb-2">
                  FOUNDATIONAL PRINCIPLES
                </p>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#064e3b] tracking-tight leading-none">
                  Our Core Values
                </h2>
              </BlurReveal>
            </div>

            <BlurReveal delay={120} className="mt-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#047857]">
                D_HEIR INTERNATIONAL
              </span>
            </BlurReveal>
          </div>

          {/* Right Panel: Stacked Stadium Pills (Icons Removed) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {values.map((val, idx) => (
              <BlurReveal key={val.title} delay={140 + idx * 50}>
                <div
                  className={`w-full rounded-[2.5rem] px-8 py-5 sm:py-6 ${val.cardBg} ${val.textColor} transition-transform duration-300 hover:translate-x-1 cursor-pointer`}
                >
                  <h3 className="font-display text-lg sm:text-xl font-extrabold mb-1">
                    {val.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
                    {val.description}
                  </p>
                </div>
              </BlurReveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
