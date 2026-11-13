"use client"

import type { NavLink as NavLinkDef } from "@/components_map_definitions/NavigationLinks"
import { useNavbarStore } from "@/store/navBarStore"
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavLinkProps = Pick<NavLinkDef, "name" | "path" | "icon"> & {
  badgeCount?: number
}

export default function NavLink({ name, path, icon: Icon, badgeCount }: NavLinkProps) {
  const pathName = usePathname()
  const closeSideBar = useNavbarStore((s) => s.closeSideBar)

  const isActive =
    pathName === path ||
    (path !== "/admin" && pathName.startsWith(path + "/"))

  return (
    <Link
      href={path}
      className={`admin-sidebar__link${isActive ? " is-active" : ""}`}
      aria-current={isActive ? "page" : undefined}
      onClick={closeSideBar}
    >
      <Icon size={22} stroke={1.5} aria-hidden />
      <span>{name}</span>
      {(name === "Inbox" || name === "Procurement") && (
        <span className="sidebar-beta-badge">Beta</span>
      )}
      {typeof badgeCount === "number" && badgeCount > 0 ? (
        <span className="admin-sidebar__badge" aria-label={`${badgeCount} pending`}>
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      ) : null}
    </Link>
  )
}
