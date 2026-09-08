"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconHome,
  IconSearch,
  IconCalculator,
  IconClipboardList,
  IconUser,
} from "@tabler/icons-react"
import { resolvePortalNavId } from "@/lib/portal/nav"

export function PortalMobileBottomNav() {
  const pathname = usePathname()
  const activeNavId = resolvePortalNavId(pathname)

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: "/customer",
      icon: IconHome,
      isActive: activeNavId === "home" && typeof window !== "undefined" && window.location.hash !== "#tracking",
    },
    {
      id: "tracking",
      label: "Tracking",
      href: "/customer#tracking",
      icon: IconSearch,
      isActive: typeof window !== "undefined" && window.location.hash === "#tracking",
    },
    {
      id: "quote",
      label: "Quote",
      href: "/customer/estimate",
      icon: IconCalculator,
      isActive: activeNavId === "quote",
    },
    {
      id: "procurement",
      label: "Procurement",
      href: "/customer/procurement",
      icon: IconClipboardList,
      isActive: activeNavId === "procurement",
    },
    {
      id: "account",
      label: "Account",
      href: "/customer/profile",
      icon: IconUser,
      isActive: activeNavId === "account",
    },
  ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur py-2 px-2 flex items-center justify-around"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const active = item.isActive

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              active ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Icon size={20} stroke={active ? 2 : 1.5} />
            <span className={`text-[10px] mt-1 font-medium ${active ? "text-blue-600 font-semibold" : ""}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
