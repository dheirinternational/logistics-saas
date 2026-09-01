"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"

export function HowItWorksSection() {
  const steps = [
    {
      num: "1",
      title: "Tell Us What You Need",
      description: "Send us product details, quantity, specifications, images, or any available information about your intended purchase.",
      bgColor: "#38bdf8", // Sky blue
      textColor: "#0f172a",
    },
    {
      num: "2",
      title: "Sourcing & Procurement",
      description: "We assist with supplier identification, communication, negotiation, and procurement coordination according to selected services.",
      bgColor: "#818cf8", // Indigo
      textColor: "#0f172a",
    },
    {
      num: "3",
      title: "Arrival at China Warehouse",
      description: "Purchased goods are coordinated for delivery to our designated receiving location in China.",
      bgColor: "#34d399", // Emerald green
      textColor: "#0f172a",
    },
    {
      num: "4",
      title: "Cargo Processing",
      description: "Goods are received, checked, consolidated, repacked, measured, and prepared for shipment.",
      bgColor: "#fbbf24", // Warm amber
      textColor: "#0f172a",
    },
    {
      num: "5",
      title: "Shipping to Nigeria",
      description: "The appropriate shipping method (Sea, Air, or Express) is selected based on shipment requirements.",
      bgColor: "#fb923c", // Vibrant orange
      textColor: "#0f172a",
    },
    {
      num: "6",
      title: "Clearing & Delivery",
      description: "Upon arrival in Nigeria, we coordinate the applicable clearing, customs, and delivery process.",
      bgColor: "#f472b6", // Pink
      textColor: "#0f172a",
    },
    {
      num: "7",
      title: "You Receive Your Goods",
      description: "Your shipment completes its connected journey from overseas supplier directly to your destination.",
      bgColor: "#1a5fff", // DHEIR Primary Blue
      textColor: "#ffffff",
    },
  ]

  return (
    <section id="how-it-works" className="marketing-section py-16 md:py-28 bg-dheir-surface w-full overflow-x-clip">
      {/* Section Header Container */}
      <div className="marketing-container mb-12 md:mb-16">
        <BlurReveal delay={0}>
          <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
            Simple Process
          </p>
        </BlurReveal>
        <BlurReveal delay={60}>
          <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-5xl mt-2 tracking-tight">
            How It Works
          </h2>
        </BlurReveal>
        <BlurReveal delay={120}>
          <p className="mt-4 max-w-2xl text-base text-dheir-muted leading-relaxed">
            Seven straightforward steps connecting your order from international suppliers to your door in Nigeria.
          </p>
        </BlurReveal>
      </div>

      {/* Full Width Overlapping Cards Container with Generous Headroom & Hidden Scrollbar */}
      <div className="w-full px-0 overflow-x-auto pt-8 pb-16 md:pb-20 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-full justify-start md:justify-center min-w-max px-4 sm:px-6 md:px-8">
          {steps.map((step, idx) => (
            <BlurReveal
              key={step.num}
              delay={140 + idx * 40}
              className={`relative w-[260px] sm:w-[300px] md:w-[340px] lg:w-[360px] shrink-0 ${
                idx > 0 ? "-ml-8 sm:-ml-10 md:-ml-12 lg:-ml-14" : ""
              }`}
              style={{ zIndex: idx + 1 }}
            >
              <div
                className="h-[560px] md:h-[640px] rounded-t-[2.5rem] rounded-b-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-6 hover:scale-[1.04] hover:z-40 cursor-pointer shadow-md"
                style={{
                  backgroundColor: step.bgColor,
                  color: step.textColor,
                }}
              >
                {/* Top Numbered Circle Badge */}
                <div>
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-display font-extrabold text-xl md:text-2xl"
                    style={{
                      border: `2px solid ${step.textColor}`,
                      color: step.textColor,
                    }}
                  >
                    {step.num}
                  </div>

                  {/* Prominent Step Title */}
                  <h3
                    className="font-display text-xl sm:text-2xl font-extrabold uppercase leading-tight mt-8 md:mt-10 tracking-tight"
                    style={{ color: step.textColor }}
                  >
                    {step.title}
                  </h3>
                </div>

                {/* Description Pill Container */}
                <div
                  className="rounded-2xl p-3.5 backdrop-blur-sm"
                  style={{
                    backgroundColor: step.textColor === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                    border: `1px solid ${step.textColor === "#ffffff" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"}`,
                  }}
                >
                  <p className="text-xs font-semibold leading-relaxed" style={{ color: step.textColor }}>
                    {step.description}
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
