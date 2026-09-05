"use client"

import { useState } from "react"
import Image from "next/image"
import { BlurReveal } from "@/components/auth/BlurReveal"
import { IconPlayerPlay, IconX } from "@tabler/icons-react"

export function AboutUsSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  return (
    <section id="about-us" className="marketing-section py-16 md:py-24 bg-dheir-page">
      <div className="marketing-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Story Copy */}
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

          {/* Right Column: Media Stack (Leadership Image & Inline Video Card) */}
          <div className="lg:col-span-5 flex flex-col gap-6 items-center">
            <BlurReveal delay={180} className="w-full max-w-md">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-dheir-surface">
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

            {/* Video Player Card */}
            <BlurReveal delay={240} className="w-full max-w-md">
              <div 
                onClick={() => setIsVideoModalOpen(true)}
                className="relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-900 cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
              >
                <video 
                  src="/video/intro-to-dheir.mp4"
                  className="object-cover w-full h-full opacity-70 group-hover:opacity-90 transition-opacity"
                  muted
                  playsInline
                  preload="metadata"
                />
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/20 transition-all">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md text-dheir-blue font-bold text-xs tracking-wide uppercase transition-transform group-hover:scale-105">
                    <div className="w-7 h-7 rounded-full bg-dheir-blue text-white flex items-center justify-center">
                      <IconPlayerPlay size={14} fill="currentColor" stroke={1.5} className="ml-0.5" />
                    </div>
                    <span>Watch D_HEIR Intro Video</span>
                  </div>
                </div>

                {/* Subtitle Badge */}
                <div className="absolute bottom-3 left-3 bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  D_HEIR Cargo Overview
                </div>
              </div>
            </BlurReveal>
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl w-full aspect-video bg-black rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video 
              src="/video/intro-to-dheir.mp4"
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              aria-label="Close player"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

