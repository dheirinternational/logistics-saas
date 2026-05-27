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
        const ordersRes = await fetch("/api/orders/user/count", {
          credentials: "include",
        })

        const nextBadges: Record<string, number> = {}

        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json()
          const open = Number(ordersJson?.data?.open ?? 0)
          nextBadges["/customer/orders"] = open
        }

        if (isMounted) setBadges(nextBadges)
      } catch {
        // best-effort
      }
    }

    fetchBadges()
    const interval = window.setInterval(fetchBadges, 30_000)
    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [])

  const sidebarLinks = useMemo(() => {
    const base = PORTAL_NAV_ITEMS.map((item) => ({
      key: item.id,
      href: item.href,
      label: item.label,
      icon: item.icon,
      isActive:
        item.id === activeId &&
        !(item.id === "shop" && pathname.startsWith("/customer/orders")),
      badgeCount: undefined as number | undefined,
    }))

    const shopOrders = {
      key: "shop-orders",
      href: "/customer/orders",
      label: "Shop orders",
      icon: IconShoppingCart,
      isActive:
        pathname === "/customer/orders" || pathname.startsWith("/customer/orders/"),
      badgeCount: badges["/customer/orders"],
    }

    const shopIndex = base.findIndex((item) => item.key === "shop")
    if (shopIndex === -1) return [...base, shopOrders]

    return [
      ...base.slice(0, shopIndex + 1),
      shopOrders,
      ...base.slice(shopIndex + 1),
    ]
  }, [activeId, badges, pathname])

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
              src="/Dheir colored.png"
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
