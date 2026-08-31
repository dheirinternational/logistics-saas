"use client"

import Image from "next/image"
import { BlurReveal } from "@/components/auth/BlurReveal"

export function AboutUsSection() {
  return (
    <section id="about-us" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <BlurReveal delay={0}>
              <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
                Who We Are
              </p>
            </BlurReveal>

            <BlurReveal delay={60}>
              <h2 className="font-display text-3xl font-extrabold text-dheir-ink md:text-4xl leading-tight">
                International trade should not feel like a maze.
              </h2>
            </BlurReveal>

            <BlurReveal delay={120}>
              <p className="text-base leading-relaxed text-dheir-muted">
                Finding a supplier is only the beginning. Understanding product specifications, negotiating prices, making payments, arranging transportation, calculating shipping costs, managing cargo, navigating customs, and receiving goods safely are all important parts of the importation process.
              </p>
            </BlurReveal>

            <BlurReveal delay={180}>
              <p className="text-base leading-relaxed text-dheir-muted">
                D_HEIR INTERNATIONAL was built to help customers navigate these stages with greater confidence. We serve as a bridge between customers and the international supply chain, helping coordinate the procurement and movement of goods from China to Nigeria.
              </p>
            </BlurReveal>

            <BlurReveal delay={240}>
              <p className="text-base font-medium text-dheir-ink leading-relaxed">
                From a single order to growing commercial shipments, we provide practical solutions designed around each customer&apos;s needs.
              </p>
            </BlurReveal>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <BlurReveal delay={180} className="w-full max-w-md">
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-dheir-surface">
                <Image
                  src="/ronke.jpg"
                  alt="D_HEIR International Leadership"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                  priority
                />
              </div>
            </BlurReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
