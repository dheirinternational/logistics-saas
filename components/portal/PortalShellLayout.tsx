"use client"

import { MarketingHeaderUserMenu } from "@/components/marketing/MarketingHeaderUserMenu"
import type { MarketingHeaderUser } from "@/lib/marketing/headerUser"
import {
  PORTAL_NAV_ITEMS,
  resolvePortalNavId,
} from "@/lib/portal/nav"
import { PortalHeader } from "@/components/portal/PortalHeader"
import { PortalSidebarLogout } from "@/components/portal/PortalSidebarLogout"
import { IconX } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

type PortalShellLayoutProps = {
  user: MarketingHeaderUser
  children: ReactNode
}

export function PortalShellLayout({ user, children }: PortalShellLayoutProps) {
  const pathname = usePathname()
  const activeId = resolvePortalNavId(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  return (
    <div className="portal-shell">
      {mobileOpen ? (
        <button
          type="button"
          className="portal-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        id="portal-sidebar"
        className={`portal-sidebar${mobileOpen ? " is-open" : ""}`}
        aria-label="Primary navigation"
      >
        <div className="portal-sidebar__head">
          <Link href="/base" className="portal-sidebar__brand">
            <Image
              src="/d_heir_logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="font-display text-lg font-bold tracking-tight text-dheir-ink">
              DHEIR
            </span>
          </Link>
          <button
            type="button"
            className="portal-sidebar__close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        <nav className="portal-sidebar__nav">
          {PORTAL_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.id === activeId

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`portal-sidebar__link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={22} stroke={1.5} aria-hidden />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="portal-sidebar__footer">
          <MarketingHeaderUserMenu
            user={user}
            onHero={false}
            showLabel
            className="portal-sidebar__user w-full max-w-none"
          />
          <PortalSidebarLogout />
        </div>
      </aside>

      <div className="portal-shell__content">
        <PortalHeader
          onOpenMenu={() => setMobileOpen(true)}
          menuExpanded={mobileOpen}
        />
        <main className="portal-shell__main">{children}</main>
      </div>
    </div>
  )
}
