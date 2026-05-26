"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"
import {
  MARKETING_SERVICES,
  SERVICES_SECTION_COPY,
  type MarketingService,
  type ServiceVariant,
} from "@/lib/marketing/services"
import {
  IconArrowRight,
  IconPackage,
  IconPlane,
  IconShip,
} from "@tabler/icons-react"
import { MarketingAnchorLink } from "@/components/marketing/MarketingAnchorLink"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const SERVICE_ICONS: Record<ServiceVariant, typeof IconPlane> = {
  air: IconPlane,
  sea: IconShip,
  express: IconPackage,
}

function ServiceColumn({ service, index }: { service: MarketingService; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const Icon = SERVICE_ICONS[service.id]

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (media.matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.28, rootMargin: "0px 0px -6% 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <article
      ref={ref}
      className={`services-column services-column--${service.id} ${
        visible ? "is-visible" : ""
      }`}
      aria-label={service.label}
      style={{ ["--service-stagger" as string]: `${index * 120}ms` }}
    >
      <div className="services-column__media">
        <Image
          src={service.imageSrc}
          alt={service.imageAlt}
          fill
          sizes="(max-width: 767px) 100vw, 33vw"
          className="object-cover"
          priority={index === 0}
        />
      </div>
      <div className="services-column__scrim" aria-hidden />
      <div
        className={`services-column__content service-reveal service-reveal--${service.id} ${
          visible ? "is-visible" : ""
        }`}
      >
        <div className="services-column__icon" aria-hidden>
          <Icon size={28} stroke={1.5} />
        </div>
        <p className="services-column__label">{service.label}</p>
        <h3 className="services-column__title">{service.title}</h3>
        <p className="services-column__body">{service.description}</p>
        <MarketingAnchorLink href="#faq" className="services-column__link">
          Learn more
          <IconArrowRight size={16} stroke={1.75} aria-hidden />
        </MarketingAnchorLink>
      </div>
    </article>
  )
}

export function ServicesSection() {
  return (
    <section
      id="services"
      className="services-section scroll-mt-[5.5rem] bg-dheir-page pb-16 md:pb-24"
      aria-labelledby="services-heading"
    >
      <div className="marketing-container pt-16 md:pt-24 pb-10 md:pb-14">
        <BlurReveal className="max-w-xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-dheir-blue">
            {SERVICES_SECTION_COPY.eyebrow}
          </p>
          <h2
            id="services-heading"
            className="font-display mt-3 text-2xl font-bold tracking-tight text-dheir-ink md:text-[1.75rem]"
          >
            {SERVICES_SECTION_COPY.title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-dheir-muted md:text-base">
            {SERVICES_SECTION_COPY.subline}
          </p>
        </BlurReveal>
      </div>

      <div className="services-columns">
        {MARKETING_SERVICES.map((service, index) => (
          <ServiceColumn key={service.id} service={service} index={index} />
        ))}
      </div>
    </section>
  )
}
