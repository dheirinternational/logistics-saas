"use client"

import Link from "next/link"
import Image from "next/image"
import { IconArrowUpRight, IconArrowRight, IconMail, IconPhone } from "@tabler/icons-react"
import { BlurReveal } from "@/components/auth/BlurReveal"

export function ContactUsSection() {
  const options = [
    {
      title: "Need to source a product?",
      subtitle: "Talk to our procurement team for supplier research and order management.",
      cta: "Start Procurement",
      href: "/auth/signup",
      btnBg: "bg-[#1a5fff] text-white hover:bg-blue-700",
      cardBg: "bg-white",
    },
    {
      title: "Need to ship goods from China to Nigeria?",
      subtitle: "Talk to our cargo & logistics team for sea, air, and express shipping.",
      cta: "Ship Freight",
      href: "/auth/signup",
      btnBg: "bg-[#0f2923] text-white hover:bg-[#163c34]",
      cardBg: "bg-white",
    },
    {
      title: "Building a regular import business?",
      subtitle: "Let us discuss a structured, long-term supply chain & logistics solution.",
      cta: "Contact Us",
      href: "/auth/signup",
      btnBg: "bg-[#a3e635] text-slate-900 hover:bg-[#86efac]",
      cardBg: "bg-white",
    },
  ]

  return (
    <section
      id="contact-us"
      className="marketing-section py-16 md:py-24 bg-[#f5f4ef] relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(#00000015 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="marketing-container relative z-10">
        
        {/* Architectural Hero Banner matching reference screenshot */}
        <div className="relative bg-[#e2e0d5] rounded-[2.5rem] p-8 sm:p-12 lg:p-16 mb-16 text-center max-w-5xl mx-auto transition-transform duration-300">
          
          {/* Top-Right Floating Founder Image Badge matching reference */}
          <div className="hidden md:block absolute -top-6 -right-6 w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white transform rotate-6 z-20">
            <Image
              src="/ronke.jpg"
              alt="Ronke - Founder D_HEIR"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom-Left Floating Accent Square Badge matching reference */}
          <div className="hidden md:flex absolute -bottom-6 -left-6 w-20 h-20 bg-[#a3e635] rounded-2xl items-center justify-center text-slate-900 transform -rotate-6 z-20">
            <IconArrowUpRight size={32} stroke={2.5} />
          </div>

          <BlurReveal delay={0}>
            <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue mb-3">
              Contact Us
            </p>
          </BlurReveal>

          <BlurReveal delay={60}>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
              Let&apos;s Move Your Business Forward
            </h2>
          </BlurReveal>

          <BlurReveal delay={120}>
            <p className="mt-6 text-base sm:text-lg text-slate-700 leading-relaxed font-medium max-w-2xl mx-auto">
              Whether you are importing for the first time, restocking an existing business, searching for products in China, or looking for a reliable logistics partner, D_HEIR INTERNATIONAL is ready to help you navigate the journey.
            </p>
          </BlurReveal>
        </div>

        {/* 3 Action CTA Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 max-w-6xl mx-auto">
          {options.map((opt, idx) => (
            <BlurReveal key={opt.title} delay={140 + idx * 80}>
              <div
                className={`flex flex-col justify-between p-8 rounded-3xl ${opt.cardBg} h-full transition-transform duration-300 hover:-translate-y-2 cursor-pointer`}
              >
                <div>
                  <h3 className="font-display text-xl font-extrabold text-slate-900 mb-3 tracking-tight leading-snug">
                    {opt.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-600 mb-8">
                    {opt.subtitle}
                  </p>
                </div>

                <Link
                  href={opt.href}
                  className={`inline-flex items-center justify-between px-6 py-3.5 rounded-full ${opt.btnBg} text-xs font-extrabold uppercase tracking-wider transition-all duration-300 mt-auto`}
                >
                  <span>{opt.cta}</span>
                  <IconArrowRight size={16} stroke={2.5} />
                </Link>
              </div>
            </BlurReveal>
          ))}
        </div>

        {/* Direct Contact & Brand Slogan Banner */}
        <BlurReveal delay={200}>
          <div className="pt-10 border-t border-slate-900/10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                D_HEIR INTERNATIONAL
              </h3>
              <p className="mt-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
                Procurement &middot; Sourcing &middot; Cargo &middot; Logistics &middot; Global Trade
              </p>
              <p className="mt-3 text-sm font-semibold text-dheir-blue max-w-lg leading-relaxed">
                Calm shipping from China to Nigeria. Warehouse, packages, and delivery in one place.
              </p>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl text-left min-w-[280px] sm:min-w-[320px] transition-transform duration-300 hover:-translate-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block mb-3">
                Contact Direct
              </span>
              
              <a
                href="mailto:support@dheirinternational.com"
                className="flex items-center gap-2.5 text-sm font-bold text-slate-900 hover:text-dheir-blue transition-colors mb-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-dheir-blue/10 text-dheir-blue shrink-0">
                  <IconMail size={16} stroke={2} />
                </div>
                <span>support@dheirinternational.com</span>
              </a>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <a
                  href="tel:+18813405374"
                  className="flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-dheir-blue transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    <IconPhone size={14} stroke={2} />
                  </div>
                  <span>+18813405374</span>
                </a>
                <a
                  href="tel:+2348167278847"
                  className="flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-dheir-blue transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    <IconPhone size={14} stroke={2} />
                  </div>
                  <span>+234 816 727 8847</span>
                </a>
              </div>
            </div>
          </div>
        </BlurReveal>

      </div>
    </section>
  )
}
