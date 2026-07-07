"use client"

import { MarketingAnchorLink } from "@/components/marketing/MarketingAnchorLink"
import { MarketingCartButton } from "@/components/marketing/MarketingCartButton"
import { MarketingHeaderUserMenu } from "@/components/marketing/MarketingHeaderUserMenu"
import type { MarketingHeaderUser } from "@/lib/marketing/headerUser"
import { MARKETING_NAV_LINKS } from "@/lib/marketing/navLinks"
import { useCartStore } from "@/store/cartStore"
import { IconMenu2, IconShoppingCart, IconX } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import {
  mobileMenuIcon,
  mobileMenuIconReduced,
  mobileMenuItem,
  mobileMenuItemReduced,
  mobileMenuPanel,
  mobileMenuPanelReduced,
} from "@/lib/motion/dheir"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

type MarketingHeaderProps = {
  user?: MarketingHeaderUser | null
}

export function MarketingHeader({ user = null }: MarketingHeaderProps) {
  const reduceMotion = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const onHero = !scrolled
  const panelMotion = reduceMotion ? mobileMenuPanelReduced : mobileMenuPanel
  const itemMotion = reduceMotion ? mobileMenuItemReduced : mobileMenuItem
  const iconMotion = reduceMotion ? mobileMenuIconReduced : mobileMenuIcon
  const menuPanelClass = onHero
    ? "border border-white/15 bg-black/50 backdrop-blur-xl"
    : "border border-[var(--color-dheir-border)] bg-dheir-surface shadow-[var(--shadow-dheir-soft)]"
  const cartCount = useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.amount_to_be_ordered, 0)
  )

  return (
    <header
      className={`marketing-header fixed inset-x-0 top-0 z-50 px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pt-[max(1rem,env(safe-area-inset-top,0px))] md:px-[max(1.5rem,env(safe-area-inset-left,0px))] md:pr-[max(1.5rem,env(safe-area-inset-right,0px))] md:pt-[max(1.25rem,env(safe-area-inset-top,0px))] ${
        onHero ? "marketing-header--hero" : "marketing-header--scrolled"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <Link
          href="/"
          className={`marketing-header-logo inline-flex min-w-0 shrink-0 items-center gap-2.5 border-0 no-underline ${
            onHero ? "marketing-header-glass" : ""
          }`}
          onClick={closeMenu}
        >
          <figure className="relative h-10 w-10 shrink-0 overflow-hidden md:h-11 md:w-11">
            <Image
              src="/Dheir colored.png"
              alt=""
              width={44}
              height={44}
              className="h-10 w-10 object-contain dheir-logo-img md:h-11 md:w-11"
              priority
            />
          </figure>
          <span className="flex min-w-0 flex-col leading-tight">
            <span
              className={`font-display text-sm font-bold tracking-tight md:text-[15px] ${
                onHero ? "text-white" : "text-dheir-ink"
              }`}
            >
              DHEIR
            </span>
            <span
              className={`hidden text-[11px] font-medium min-[400px]:inline md:text-xs ${
                onHero ? "text-white/70" : "text-dheir-muted"
              }`}
            >
              International
            </span>
          </span>
        </Link>

        <nav
          className={`marketing-hero-nav-pill absolute left-1/2 hidden -translate-x-1/2 lg:flex ${
            onHero ? "marketing-hero-nav-pill--hero" : "marketing-hero-nav-pill--scrolled"
          }`}
          aria-label="Primary"
        >
          {MARKETING_NAV_LINKS.map((link) => (
            <MarketingAnchorLink
              key={link.href}
              href={link.href}
              className="marketing-hero-nav-pill__link"
            >
              {link.label}
            </MarketingAnchorLink>
          ))}
        </nav>

        <div
          className={`flex shrink-0 items-center gap-2 sm:gap-2.5 ${
            onHero ? "marketing-header-glass marketing-header-actions" : ""
          }`}
        >
          {/* <MarketingCartButton
            onHero={onHero}
            onNavigate={closeMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full"
          /> */}
          {user ? (
            <>
              <MarketingHeaderUserMenu
                user={user}
                onHero={onHero}
                onNavigate={closeMenu}
                showLabel={false}
                className="sm:hidden"
              />
              <MarketingHeaderUserMenu
                user={user}
                onHero={onHero}
                onNavigate={closeMenu}
                className="hidden sm:inline-flex"
              />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`hidden min-h-10 items-center rounded-full px-3.5 text-[14px] font-semibold no-underline sm:inline-flex ${
                  onHero
                    ? "text-white/88 transition-colors hover:bg-white/10 hover:text-white"
                    : "dheir-btn-ghost"
                }`}
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className={`marketing-header-cta inline-flex min-h-10 items-center justify-center rounded-full px-3.5 text-[13px] font-semibold no-underline transition-[background-color,box-shadow,transform] min-[400px]:px-5 min-[400px]:text-[14px] ${
                  onHero
                    ? "bg-dheir-blue text-white hover:bg-dheir-blue-hover"
                    : "dheir-btn-primary w-auto"
                }`}
              >
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${
              onHero
                ? "text-white transition-colors hover:bg-white/10"
                : "marketing-header-menu-btn border border-[var(--color-dheir-border)] bg-dheir-surface text-dheir-ink"
            }`}
            aria-expanded={menuOpen}
            aria-controls="marketing-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="relative flex h-[22px] w-[22px] items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="close"
                    className="absolute inset-0 flex items-center justify-center"
                    {...iconMotion}
                  >
                    <IconX size={22} stroke={1.5} aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    className="absolute inset-0 flex items-center justify-center"
                    {...iconMotion}
                  >
                    <IconMenu2 size={22} stroke={1.5} aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="marketing-mobile-menu"
            className={`marketing-mobile-menu mx-auto mt-3 w-full max-w-[1360px] origin-top overflow-hidden rounded-2xl px-4 py-4 lg:hidden ${menuPanelClass}`}
            variants={panelMotion}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile primary">
              {MARKETING_NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={itemMotion}>
                  <MarketingAnchorLink
                    href={link.href}
                    className={`block rounded-xl px-3 py-2.5 text-[15px] font-medium no-underline transition-colors ${
                      onHero
                        ? "text-white hover:bg-white/10"
                        : "text-dheir-ink hover:bg-dheir-page hover:text-dheir-blue"
                    }`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </MarketingAnchorLink>
                </motion.div>
              ))}
            </nav>
            <motion.div
              variants={itemMotion}
              className={`mt-4 flex flex-col gap-2 border-t pt-4 ${
                onHero ? "border-white/15" : "border-[var(--color-dheir-border)]"
              }`}
            >
              {/* <Link
                href="/customer/marketplace/cart"
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold no-underline ${
                  onHero
                    ? "text-white hover:bg-white/10"
                    : "text-dheir-ink hover:bg-dheir-page"
                }`}
                onClick={closeMenu}
              >
                <IconShoppingCart size={20} stroke={1.5} aria-hidden />
                <span className="flex-1">Cart</span>
                {cartCount > 0 && (
                  <span className="inline-flex min-w-[1.375rem] items-center justify-center rounded-full bg-dheir-blue px-1.5 py-0.5 text-xs font-bold text-white tabular-nums">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link> */}
              {user ? (
                <MarketingHeaderUserMenu
                  user={user}
                  onHero={onHero}
                  onNavigate={closeMenu}
                  className="min-h-11 w-full justify-start px-2"
                />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={`min-h-11 w-full rounded-xl text-center text-[15px] font-semibold leading-[44px] no-underline ${
                      onHero ? "text-white/90" : "dheir-btn-ghost"
                    }`}
                    onClick={closeMenu}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="dheir-btn-primary min-h-11 w-full rounded-full"
                    onClick={closeMenu}
                  >
                    Get started
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
