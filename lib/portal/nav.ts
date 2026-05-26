import type { TablerIcon } from "@tabler/icons-react"
import {
  IconCalculator,
  IconHome,
  IconPackage,
  IconShoppingBag,
  IconUser,
} from "@tabler/icons-react"

export type PortalNavId = "home" | "packages" | "quote" | "shop" | "account"

export type PortalNavItem = {
  id: PortalNavId
  label: string
  href: string
  icon: TablerIcon
}

/** Primary sidebar navigation — see plan.md §9 */
export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { id: "home", label: "Home", href: "/base", icon: IconHome },
  {
    id: "packages",
    label: "Packages",
    href: "/base/packages",
    icon: IconPackage,
  },
  { id: "quote", label: "Quote", href: "/base/estimate", icon: IconCalculator },
  { id: "shop", label: "Shop", href: "/base/shop", icon: IconShoppingBag },
  { id: "account", label: "Account", href: "/base/profile", icon: IconUser },
]

const SHOP_PREFIXES = [
  "/base/shop",
  "/base/marketplace",
] as const

const PACKAGES_PREFIXES = [
  "/base/packages",
  "/base/all_packages",
  "/base/add_package",
  "/base/waiting_to_be_stored",
  "/base/waiting_to_be_released",
  "/base/request_mail",
  "/base/warehouse_address",
  "/base/orders_shipped",
] as const

const ACCOUNT_PREFIXES = [
  "/base/profile",
  "/base/edit_profile",
  "/base/my_address",
  "/base/payment_receipts",
  "/base/pending_payments",
  "/base/orders",
  "/base/verify_payment",
  "/base/verify_order_payment",
] as const

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function matchesAnyPrefix(
  pathname: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some((prefix) => matchesPrefix(pathname, prefix))
}

/** Highlights the correct tab on nested portal routes. */
export function resolvePortalNavId(pathname: string): PortalNavId {
  if (pathname === "/base" || pathname.startsWith("/base/announcements")) {
    return "home"
  }

  if (pathname.startsWith("/base/estimate")) {
    return "quote"
  }

  if (matchesAnyPrefix(pathname, SHOP_PREFIXES)) {
    return "shop"
  }

  if (matchesAnyPrefix(pathname, PACKAGES_PREFIXES)) {
    return "packages"
  }

  if (matchesAnyPrefix(pathname, ACCOUNT_PREFIXES)) {
    return "account"
  }

  return "home"
}
