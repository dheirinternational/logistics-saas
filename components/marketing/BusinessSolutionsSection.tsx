"use client"

import { IconUser, IconShoppingBag, IconDeviceLaptop, IconBuildingSkyscraper, IconUserPlus, IconBuildingStore } from "@tabler/icons-react"
import { BlurReveal } from "@/components/auth/BlurReveal"

export function BusinessSolutionsSection() {
  const audiences = [
    {
      title: "Entrepreneurs",
      description: "Individuals looking to start or expand an import-based business.",
      icon: IconUser,
    },
    {
      title: "Retailers",
      description: "Businesses sourcing products for resale.",
      icon: IconShoppingBag,
    },
    {
      title: "Online Sellers",
      description: "E-commerce and social-commerce businesses purchasing inventory internationally.",
      icon: IconDeviceLaptop,
    },
    {
      title: "Established Businesses",
      description: "Companies requiring regular procurement and logistics support.",
      icon: IconBuildingSkyscraper,
    },
    {
      title: "New Importers",
      description: "First-time importers who need guidance through the process.",
      icon: IconUserPlus,
    },
    {
      title: "Commercial Buyers",
      description: "Customers purchasing goods in larger quantities for business, distribution, or commercial use.",
      icon: IconBuildingStore,
    },
  ]

  return (
    <section id="business-solutions" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        <div className="max-w-3xl mb-16">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Business Solutions
            </p>
          </BlurReveal>

          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-5xl mt-2 tracking-tight">
              Who We Serve
            </h2>
          </BlurReveal>

          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              D_HEIR INTERNATIONAL works with customers at different stages of their business journey, providing practical trade infrastructure.
            </p>
          </BlurReveal>
        </div>

        {/* Audience Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((item, idx) => {
            const Icon = item.icon
            return (
              <BlurReveal key={item.title} delay={140 + idx * 60}>
                <div className="flex flex-col gap-4 p-6 rounded-2xl bg-dheir-surface h-full transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dheir-blue/10 text-dheir-blue">
                    <Icon size={20} stroke={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-dheir-ink">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-dheir-muted">{item.description}</p>
                </div>
              </BlurReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
