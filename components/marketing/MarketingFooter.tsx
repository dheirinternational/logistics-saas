import { MarketingAnchorLink } from "@/components/marketing/MarketingAnchorLink"
import {
  LEGAL_LINKS,
  SITE_CONTACT,
  SITE_SOCIAL,
} from "@/lib/marketing/siteContact"
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconMail,
  IconPhone,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

const FOOTER_NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Services", href: "#services" },
  { label: "FAQ", href: "#faq" },
] as const

export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="marketing-footer" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      <div className="marketing-footer__map" aria-hidden />

      <div className="marketing-footer__inner marketing-container pb-10 pt-16 md:pb-12 md:pt-20">
        <div className="marketing-footer__grid">
          <div className="marketing-footer__brand">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
              <figure className="relative h-10 w-10 shrink-0 overflow-hidden bg-transparent md:h-11 md:w-11">
                <Image
                  src="/Dheir colored.png"
                  alt=""
                  width={44}
                  height={44}
                  className="h-10 w-10 object-contain dheir-logo-img md:h-11 md:w-11"
                />
              </figure>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-sm font-bold text-white">
                  DHEIR
                </span>
                <span className="text-[11px] font-medium text-white/65">
                  International
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/70">
              Calm shipping from China to Nigeria. Warehouse, packages, and
              delivery in one place.
            </p>
          </div>

          <div>
            <p className="marketing-footer__label">Contact</p>
            <ul className="marketing-footer__list mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="marketing-footer__link inline-flex items-center gap-2.5"
                >
                  <IconMail size={18} stroke={1.5} aria-hidden />
                  {SITE_CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONTACT.phoneHref}
                  className="marketing-footer__link inline-flex items-center gap-2.5"
                >
                  <IconPhone size={18} stroke={1.5} aria-hidden />
                  {SITE_CONTACT.phone}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="marketing-footer__label">Explore</p>
            <ul className="marketing-footer__list mt-4 space-y-2.5">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <MarketingAnchorLink
                    href={item.href}
                    className="marketing-footer__link"
                  >
                    {item.label}
                  </MarketingAnchorLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="marketing-footer__label">Legal</p>
            <ul className="marketing-footer__list mt-4 space-y-2.5">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="marketing-footer__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="marketing-footer__label mt-8">Follow us</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={SITE_SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="marketing-footer__social"
                aria-label="DHEIR on Facebook"
              >
                <IconBrandFacebook size={20} stroke={1.5} aria-hidden />
              </a>
              <a
                href={SITE_SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="marketing-footer__social"
                aria-label="DHEIR on Instagram"
              >
                <IconBrandInstagram size={20} stroke={1.5} aria-hidden />
              </a>
              <a
                href={SITE_SOCIAL.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="marketing-footer__social"
                aria-label="DHEIR on Tiktok"
              >
                <IconBrandTiktok size={20} stroke={1.5} aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="marketing-footer__bottom mt-12 border-t border-white/10 pt-6 md:mt-14">
          <p className="text-center text-[13px] text-white/55 md:text-left">
            © {year} DHEIR International. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
