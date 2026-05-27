"use client"

import { AdminSidebarLogout } from "@/components/admin/AdminSidebarLogout"
import { navLinks } from "@/components_map_definitions/NavigationLinks"
import { useNavbarStore } from "@/store/navBarStore"
import { IconX } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import NavLink from "../NavLink"

export const SideBar = () => {
  const pathname = usePathname()
  const { isSideBarActive, setIsSideBarActive, closeSideBar } = useNavbarStore()
  const [badges, setBadges] = useState<Record<string, number>>({})

  useEffect(() => {
    closeSideBar()
  }, [pathname, closeSideBar])

  useEffect(() => {
    let isMounted = true

    const fetchBadges = async () => {
      try {
        const [ordersRes, shipmentsRes, manualPaymentsRes] = await Promise.all([
          fetch("/api/orders/count", { credentials: "include" }),
          fetch("/api/shipments/count", { credentials: "include" }),
          fetch("/api/manual-payments/admin/count", { credentials: "include" }),
        ])

        const nextBadges: Record<string, number> = {}

        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json()
          const open = Number(ordersJson?.data?.open ?? 0)
          nextBadges["/admin/orders"] = open
        }

        if (shipmentsRes.ok) {
          const shipmentsJson = await shipmentsRes.json()
          const active = Number(shipmentsJson?.data?.total_active_count ?? 0)
          nextBadges["/admin/shipments"] = active
        }

        if (manualPaymentsRes.ok) {
          const manualJson = await manualPaymentsRes.json()
          const awaiting = Number(manualJson?.data?.count ?? 0)
          nextBadges["/admin/payments/confirmations"] = awaiting
        }

        if (isMounted) setBadges(nextBadges)
      } catch {
        // badges are best-effort; ignore failures
      }
    }

    fetchBadges()
    const interval = window.setInterval(fetchBadges, 30_000)
    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [])

  const navLinksWithBadges = useMemo(() => {
    return navLinks.map((link) => ({
      ...link,
      badgeCount: badges[link.path],
    }))
  }, [badges])

  useEffect(() => {
    if (!isSideBarActive) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSideBar()
    }
    document.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [isSideBarActive, closeSideBar])

  return (
    <>
      {isSideBarActive ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeSideBar}
        />
      ) : null}

      <aside
        id="admin-sidebar"
        className={`admin-sidebar${isSideBarActive ? " is-open" : ""}`}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar__head">
          <Link href="/admin" className="admin-sidebar__brand">
            <Image
              src="/Dheir colored.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain dheir-logo-img"
              priority
            />
            <span className="admin-sidebar__brand-text">
              <span className="font-display text-lg font-bold tracking-tight text-dheir-ink">
                DHEIR
              </span>
              <span className="admin-sidebar__brand-sub">Admin</span>
            </span>
          </Link>
          <button
            type="button"
            className="admin-sidebar__close"
            onClick={closeSideBar}
            aria-label="Close menu"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {navLinksWithBadges.map((link) => (
            <NavLink key={link.path} {...link} badgeCount={link.badgeCount} />
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <AdminSidebarLogout />
        </div>
      </aside>
    </>
  )
}
