"use client"

import Link from "next/link"
import { IconSearch, IconTruck, IconBuildingStore, IconArrowRight } from "@tabler/icons-react"
import { BlurReveal } from "@/components/auth/BlurReveal"

export function ContactUsSection() {
  const options = [
    {
      title: "Need to source a product?",
      subtitle: "Talk to our procurement team for supplier research and order management.",
      cta: "Start Procurement",
      href: "/auth/signup",
      icon: IconSearch,
    },
    {
      title: "Need to ship goods from China to Nigeria?",
      subtitle: "Talk to our cargo & logistics team for sea, air, and express shipping.",
      cta: "Ship Freight",
      href: "/auth/signup",
      icon: IconTruck,
    },
    {
      title: "Building a regular import business?",
      subtitle: "Let us discuss a structured, long-term supply chain & logistics solution.",
      cta: "Contact Us",
      href: "/auth/signup",
      icon: IconBuildingStore,
    },
  ]

  return (
    <section id="contact-us" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        <div className="max-w-3xl mb-16">
          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
              Contact Us
            </p>
          </BlurReveal>
          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-4xl mt-2">
              Let&apos;s Move Your Business Forward
            </h2>
          </BlurReveal>
          <BlurReveal delay={120}>
            <p className="mt-4 text-base text-dheir-muted leading-relaxed">
              Whether you are importing for the first time, restocking an existing business, searching for products in China, or looking for a reliable logistics partner, D_HEIR INTERNATIONAL is ready to help you navigate the journey.
            </p>
          </BlurReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {options.map((opt, idx) => {
            const Icon = opt.icon
            return (
              <BlurReveal key={opt.title} delay={140 + idx * 80}>
                <div className="flex flex-col justify-between gap-6 p-8 rounded-2xl bg-dheir-surface h-full">
                  <div className="flex flex-col gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dheir-blue/10 text-dheir-blue">
                      <Icon size={22} stroke={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-dheir-ink leading-snug">{opt.title}</h3>
                    <p className="text-xs leading-relaxed text-dheir-muted">{opt.subtitle}</p>
                  </div>
                  <Link
                    href={opt.href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-dheir-blue hover:text-dheir-blue-hover transition-colors mt-auto"
                  >
                    {opt.cta}
                    <IconArrowRight size={16} stroke={2} />
                  </Link>
                </div>
              </BlurReveal>
            )
          })}
        </div>

        {/* Footer Brand Slogan */}
        <BlurReveal delay={200}>
          <div className="text-center pt-8 border-t border-dheir-border/60">
            <h3 className="font-display text-xl font-bold text-dheir-ink">D_HEIR INTERNATIONAL</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-dheir-muted">
              Procurement · Sourcing · Cargo · Logistics · Global Trade
            </p>
            <p className="mt-3 text-sm font-medium text-dheir-blue">
              Connecting Nigeria to Global Opportunities · From Global Markets to Your Business
            </p>
          </div>
        </BlurReveal>
      </div>
    </section>
  )
}
