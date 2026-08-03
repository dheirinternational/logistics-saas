"use client"

import { MarketingHeaderUserMenu } from "@/components/marketing/MarketingHeaderUserMenu"
import type { MarketingHeaderUser } from "@/lib/marketing/headerUser"
import {
  PORTAL_NAV_ITEMS,
  resolvePortalNavId,
} from "@/lib/portal/nav"
import { PortalHeader } from "@/components/portal/PortalHeader"
import { PortalViewSwitch } from "@/components/PortalViewSwitch"
import { PortalSidebarLogout } from "@/components/portal/PortalSidebarLogout"
import { IconX } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { IconShoppingCart } from "@tabler/icons-react"

type PortalShellLayoutProps = {
  user: MarketingHeaderUser
  children: ReactNode
}

export function PortalShellLayout({ user, children }: PortalShellLayoutProps) {
  const pathname = usePathname()
  const activeId = resolvePortalNavId(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [badges, setBadges] = useState<Record<string, number>>({})

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    let isMounted = true

    const fetchBadges = async () => {
      try {
        const [ordersRes, inboxRes] = await Promise.all([
          fetch("/api/orders/user/count", { credentials: "include" }),
          fetch("/api/inbox/unread-count", { credentials: "include" }),
        ])

        const nextBadges: Record<string, number> = {}

        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json()
          const open = Number(ordersJson?.data?.open ?? 0)
          nextBadges["/customer/orders"] = open
        }

        if (inboxRes.ok) {
          const inboxJson = await inboxRes.json()
          const count = Number(inboxJson?.data?.count ?? 0)
          if (count > 0) nextBadges["/customer/inbox"] = count
        }

        if (isMounted) setBadges(nextBadges)
      } catch {
        // best-effort
      }
    }

    fetchBadges()

    // Re-fetch when user returns to tab (no polling while idle)
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchBadges()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      isMounted = false
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  const sidebarLinks = useMemo(() => {
    return PORTAL_NAV_ITEMS.map((item) => ({
      key: item.id,
      href: item.href,
      label: item.label,
      icon: item.icon,
      isActive: item.id === activeId,
      badgeCount: badges[item.href] as number | undefined,
    }))
  }, [activeId, badges])

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
          <Link href="/customer" className="portal-sidebar__brand">
            <Image
              src="/DHEIR colored.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain dheir-logo-img"
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
          {sidebarLinks.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`portal-sidebar__link${item.isActive ? " is-active" : ""}`}
                aria-current={item.isActive ? "page" : undefined}
              >
                <Icon size={22} stroke={1.5} aria-hidden />
                <span>{item.label}</span>
                {item.key === "inbox" && (
                  <span className="sidebar-beta-badge">Beta</span>
                )}
                {item.badgeCount !== undefined ? (
                  <span
                    className="portal-sidebar__badge"
                    aria-label={`${item.badgeCount} pending`}
                  >
                    {item.badgeCount > 99 ? "99+" : item.badgeCount}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="portal-sidebar__footer">
          <PortalViewSwitch
            userRole={user.role}
            variant="customer"
            onNavigate={() => setMobileOpen(false)}
          />
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
