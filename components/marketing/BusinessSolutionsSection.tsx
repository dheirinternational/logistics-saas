"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"

export function BusinessSolutionsSection() {
  const audiences = [
    {
      title: "Entrepreneurs",
      description: "Individuals looking to start or expand an import-based business.",
      bgColor: "bg-[#fef08a]", // Soft bright yellow
      textColor: "text-slate-900",
      rotation: "-rotate-2 hover:rotate-0",
      zIndex: "z-10",
    },
    {
      title: "Retailers",
      description: "Businesses sourcing products for resale.",
      bgColor: "bg-[#fca5a5]", // Coral pink
      textColor: "text-slate-900",
      rotation: "rotate-3 hover:rotate-0",
      zIndex: "z-20",
    },
    {
      title: "Online Sellers",
      description: "E-commerce and social-commerce businesses purchasing inventory internationally.",
      bgColor: "bg-[#7dd3fc]", // Soft cyan blue
      textColor: "text-slate-900",
      rotation: "-rotate-1 hover:rotate-0",
      zIndex: "z-30",
    },
    {
      title: "Established Businesses",
      description: "Companies requiring regular procurement and logistics support.",
      bgColor: "bg-[#e9d5ff]", // Soft purple
      textColor: "text-slate-900",
      rotation: "rotate-2 hover:rotate-0",
      zIndex: "z-10",
    },
    {
      title: "New Importers",
      description: "First-time importers who need guidance through the process.",
      bgColor: "bg-[#d9f99d]", // Soft lime green
      textColor: "text-slate-900",
      rotation: "-rotate-3 hover:rotate-0",
      zIndex: "z-20",
    },
    {
      title: "Commercial Buyers",
      description: "Customers purchasing goods in larger quantities for business, distribution, or commercial use.",
      bgColor: "bg-[#fdba74]", // Soft amber orange
      textColor: "text-slate-900",
      rotation: "rotate-1 hover:rotate-0",
      zIndex: "z-30",
    },
  ]

  return (
    <section id="business-solutions" className="marketing-section py-16 md:py-24 bg-[#f7f5f0]">
      <div className="marketing-container">
        
        {/* Editorial Centered Header matching reference mockup */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Business Solutions
            </p>
          </BlurReveal>

          <BlurReveal delay={60}>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mt-3">
              Who We Serve
            </h2>
          </BlurReveal>

          <BlurReveal delay={120}>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              D_HEIR INTERNATIONAL works with customers at different stages of their business journey, providing practical trade infrastructure.
            </p>
          </BlurReveal>
        </div>

        {/* Overlapping Scattered Sticky-Notes Grid matching reference screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4 pb-8">
          {audiences.map((item, idx) => (
            <BlurReveal key={item.title} delay={140 + idx * 50}>
              <div
                className={`relative flex flex-col justify-between p-7 sm:p-8 rounded-2xl min-h-[220px] sm:min-h-[240px] ${item.bgColor} ${item.textColor} ${item.rotation} ${item.zIndex} transition-all duration-300 hover:z-50 hover:scale-[1.04] cursor-pointer`}
              >
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-800 opacity-90">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Marker Tag matching sticky-note visual aesthetic */}
                <div className="pt-4 border-t border-slate-900/10 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700">
                    D_HEIR CLIENTELE
                  </span>
                  <span className="h-2 w-2 rounded-full bg-slate-900" />
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>

      </div>
    </section>
  )
}
