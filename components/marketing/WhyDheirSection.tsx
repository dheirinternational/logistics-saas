"use client"

import { useState } from "react"
import { IconPlus, IconMinus, IconCheck } from "@tabler/icons-react"
import { BlurReveal } from "@/components/auth/BlurReveal"

export function WhyDheirSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const whyPoints = [
    {
      title: "One Journey, Multiple Solutions",
      description: "Instead of leaving customers to coordinate every stage independently, we help connect procurement and logistics into a more organized process.",
      collapsedBg: "bg-[#4fef85]", // Bright Ramp mint
      textColor: "text-slate-900",
    },
    {
      title: "Practical Importation Support",
      description: "We understand that international trade involves more than purchasing a product. Shipping, cargo handling, documentation, customs, and delivery all matter.",
      collapsedBg: "bg-[#e3ff54]", // Bright Ramp lime
      textColor: "text-slate-900",
    },
    {
      title: "Customer-Centric Approach",
      description: "Every shipment is different. Product type, quantity, volume, urgency, budget, and destination can influence the best logistics solution.",
      collapsedBg: "bg-[#60a5fa]", // Soft sky blue
      textColor: "text-slate-900",
    },
    {
      title: "Transparency",
      description: "We believe customers should understand what they are paying for and why. Clear communication, defined processes, and proper cost considerations.",
      collapsedBg: "bg-[#a7f3d0]", // Soft emerald
      textColor: "text-slate-900",
    },
    {
      title: "Business-Focused Solutions",
      description: "Designed for individuals, entrepreneurs, and businesses building sustainable, long-term international supply chains.",
      collapsedBg: "bg-[#fef08a]", // Soft amber
      textColor: "text-slate-900",
    },
  ]

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="why-dheir" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Why Choose Us
            </p>
          </BlurReveal>
          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-5xl mt-2 tracking-tight">
              Why D_HEIR International?
            </h2>
          </BlurReveal>
          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              Connecting opportunity, procurement, and logistics into one seamless, trusted experience.
            </p>
          </BlurReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Panel: Vision, Mission & Value Preview Card matching Ramp style */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <BlurReveal delay={140}>
              <div className="p-8 rounded-[2.5rem] bg-dheir-surface flex flex-col justify-between h-full space-y-8">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-dheir-blue block mb-3">
                    Our Vision
                  </span>
                  <p className="text-sm font-medium text-dheir-ink leading-relaxed">
                    To become a trusted international procurement and logistics brand connecting African businesses and consumers to global markets.
                  </p>
                </div>

                <div className="pt-6 border-t border-dheir-border/60">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-dheir-blue block mb-3">
                    Our Mission
                  </span>
                  <p className="text-sm font-medium text-dheir-ink leading-relaxed">
                    To provide accessible, transparent, and dependable procurement and logistics solutions that help individuals and businesses successfully participate in international trade.
                  </p>
                </div>

                <div className="pt-6 border-t border-dheir-border/60">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-dheir-blue block mb-3">
                    Our Value
                  </span>
                  <p className="text-sm font-medium text-dheir-ink leading-relaxed">
                    A business in Nigeria should be able to discover opportunities in China without having to build an entire overseas operation from scratch.
                  </p>
                </div>
              </div>
            </BlurReveal>
          </div>

          {/* Right Panel: Ramp-Style Interactive Accordion Cards */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {whyPoints.map((point, idx) => {
              const isOpen = openIndex === idx

              return (
                <BlurReveal key={point.title} delay={140 + idx * 50}>
                  {isOpen ? (
                    /* Expanded Accordion Card (Ramp Style) */
                    <div
                      onClick={() => toggleAccordion(idx)}
                      className="rounded-[2.25rem] p-8 md:p-10 bg-dheir-surface text-slate-900 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <IconMinus size={28} stroke={3} className="shrink-0 text-slate-900" />
                        <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
                          {point.title}
                        </h3>
                      </div>

                      <div className="pt-4 border-t border-slate-900/15 mt-4 space-y-4">
                        <p className="text-sm md:text-base font-medium text-slate-700 leading-relaxed">
                          {point.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-extrabold text-dheir-blue pt-2">
                          <IconCheck size={16} stroke={3} />
                          <span>Structured, end-to-end trade coordination by D_HEIR International</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Collapsed Accordion Pill (Ramp Style) */
                    <div
                      onClick={() => toggleAccordion(idx)}
                      className={`rounded-3xl p-6 sm:p-7 ${point.collapsedBg} ${point.textColor} flex items-center gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.01]`}
                    >
                      <IconPlus size={24} stroke={3} className="shrink-0 text-slate-900" />
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
                        {point.title}
                      </h3>
                    </div>
                  )}
                </BlurReveal>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
