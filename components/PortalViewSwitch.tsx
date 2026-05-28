"use client"

import { ADMIN_PORTAL_ENTRY, isAdminRole } from "@/lib/auth/postAuthRedirect"
import { CUSTOMER_PORTAL_ENTRY } from "@/lib/portal/customerEntry"
import { useNavbarStore } from "@/store/navBarStore"
import { IconLayoutDashboard, IconShoppingBag } from "@tabler/icons-react"
import Link from "next/link"

type PortalViewSwitchProps = {
  userRole: string
  /** Which sidebar shell is showing this control. */
  variant: "admin" | "customer"
  onNavigate?: () => void
}

export function PortalViewSwitch({
  userRole,
  variant,
  onNavigate,
}: PortalViewSwitchProps) {
  const closeAdminSideBar = useNavbarStore((s) => s.closeSideBar)

  if (!isAdminRole(userRole)) {
    return null
  }

  const linkClass =
    variant === "admin" ? "admin-sidebar__link" : "portal-sidebar__link"

  const handleNavigate = () => {
    if (variant === "admin") {
      closeAdminSideBar()
    }
    onNavigate?.()
  }

  if (variant === "admin") {
    return (
      <div className="portal-view-switch" aria-label="Portal view">
        <Link
          href={CUSTOMER_PORTAL_ENTRY}
          className={linkClass}
          onClick={handleNavigate}
        >
          <IconShoppingBag size={22} stroke={1.5} aria-hidden />
          <span>Switch to customer</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="portal-view-switch" aria-label="Portal view">
      <Link
        href={ADMIN_PORTAL_ENTRY}
        className={linkClass}
        onClick={handleNavigate}
      >
        <IconLayoutDashboard size={22} stroke={1.5} aria-hidden />
        <span>Switch to admin</span>
      </Link>
    </div>
  )
}
