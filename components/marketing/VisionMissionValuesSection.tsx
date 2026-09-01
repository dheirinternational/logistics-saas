"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"

export function VisionMissionValuesSection() {
  const cards = [
    {
      title: "Our Vision",
      description: "To become a trusted international procurement and logistics brand connecting African businesses and consumers to global markets.",
      bgColor: "bg-[#fcd34d]", // Warm gold/amber
      textColor: "text-slate-900",
      badgeBg: "bg-slate-900",
      badgeText: "text-white",
    },
    {
      title: "Our Mission",
      description: "To provide accessible, transparent, and dependable procurement and logistics solutions that help individuals and businesses successfully participate in international trade.",
      bgColor: "bg-[#ff8a65]", // Coral orange
      textColor: "text-slate-900",
      badgeBg: "bg-slate-900",
      badgeText: "text-white",
    },
    {
      title: "Our Value",
      description: "A business in Nigeria should be able to discover opportunities in China without having to build an entire overseas operation from scratch.",
      bgColor: "bg-[#d9f99d]", // Lime green
      textColor: "text-slate-900",
      badgeBg: "bg-slate-900",
      badgeText: "text-white",
    },
    {
      title: "Integrity",
      description: "We believe trust is the foundation of every successful business relationship.",
      bgColor: "bg-[#c084fc]", // Purple
      textColor: "text-slate-900",
      badgeBg: "bg-slate-900",
      badgeText: "text-white",
    },
    {
      title: "Transparency",
      description: "We communicate clearly about services, processes, costs, and expectations.",
      bgColor: "bg-[#38bdf8]", // Cyan blue
      textColor: "text-slate-900",
      badgeBg: "bg-slate-900",
      badgeText: "text-white",
    },
    {
      title: "Reliability",
      description: "We understand that customers are trusting us with their money, products, and business plans.",
      bgColor: "bg-[#34d399]", // Emerald green
      textColor: "text-slate-900",
      badgeBg: "bg-slate-900",
      badgeText: "text-white",
    },
    {
      title: "Professionalism",
      description: "Every shipment and customer interaction should be handled with structure and accountability.",
      bgColor: "bg-[#f472b6]", // Rose pink
      textColor: "text-slate-900",
      badgeBg: "bg-slate-900",
      badgeText: "text-white",
    },
    {
      title: "Continuous Improvement",
      description: "We continue to improve our processes, partnerships, and customer experience as international trade evolves.",
      bgColor: "bg-[#1a5fff]", // D_HEIR Blue
      textColor: "text-white",
      badgeBg: "bg-white",
      badgeText: "text-[#1a5fff]",
    },
  ]

  return (
    <section id="vision-mission-values" className="marketing-section py-16 md:py-24 bg-dheir-surface">
      <div className="marketing-container">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Foundational Purpose
            </p>
          </BlurReveal>
          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-5xl mt-2 tracking-tight">
              Vision, Mission & Core Values
            </h2>
          </BlurReveal>
          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              The principles and commitment driving our procurement and logistics infrastructure.
            </p>
          </BlurReveal>
        </div>

        {/* Sticky-Note Grid Cards matching reference screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <BlurReveal key={card.title} delay={140 + idx * 40}>
              <div
                className={`flex flex-col justify-between p-6 sm:p-7 rounded-3xl min-h-[260px] sm:min-h-[280px] ${card.bgColor} ${card.textColor} transition-transform duration-300 hover:-translate-y-2 cursor-pointer`}
              >
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-extrabold mb-3 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed opacity-95">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Corner Circle Badge matching screenshot */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/10">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-75">
                    D_HEIR
                  </span>
                  <div className={`w-7 h-7 rounded-full ${card.badgeBg} ${card.badgeText} flex items-center justify-center font-bold text-xs`}>
                    ✓
                  </div>
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>

      </div>
    </section>
  )
}
