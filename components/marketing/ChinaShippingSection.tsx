"use client"

import { IconShip, IconPlane, IconTruck } from "@tabler/icons-react"
import { BlurReveal } from "@/components/auth/BlurReveal"

export function ChinaShippingSection() {
  const shippingMethods = [
    {
      title: "Sea Freight",
      description: "Suitable for larger and heavier commercial shipments where cost efficiency is important.",
      icon: IconShip,
    },
    {
      title: "Air Freight",
      description: "Suitable for customers who need a faster transportation option for eligible goods.",
      icon: IconPlane,
    },
    {
      title: "Express Shipping",
      description: "Designed for smaller and time-sensitive shipments where speed is a priority.",
      icon: IconTruck,
    },
  ]

  return (
    <section id="china-shipping" className="marketing-section py-16 md:py-24 bg-dheir-surface">
      <div className="marketing-container">
        <div className="max-w-3xl mb-12">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Service 03
            </p>
          </BlurReveal>

          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-4xl mt-2">
              China-to-Nigeria Shipping
            </h2>
          </BlurReveal>

          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              We coordinate the movement of goods from China to Nigeria through appropriate shipping options depending on the nature, size, urgency, and volume of the shipment.
            </p>
          </BlurReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shippingMethods.map((method, idx) => {
            const Icon = method.icon
            return (
              <BlurReveal key={method.title} delay={150 + idx * 80}>
                <div className="flex flex-col gap-4 p-8 rounded-2xl bg-dheir-page h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dheir-blue/10 text-dheir-blue">
                    <Icon size={24} stroke={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-dheir-ink">{method.title}</h3>
                  <p className="text-sm text-dheir-muted leading-relaxed">{method.description}</p>
                </div>
              </BlurReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
