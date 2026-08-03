import type { TablerIcon } from "@tabler/icons-react"
import {
  IconCalculator,
  IconPackage,
  IconClipboardList,
  IconTruckDelivery,
  IconUser,
} from "@tabler/icons-react"

export type PortalNavId = "home" | "packages" | "quote" | "shop" | "account" | "procurement"

export type PortalNavItem = {
  id: PortalNavId
  label: string
  href: string
  icon: TablerIcon
}

/** Primary sidebar navigation - see plan.md §9 */
export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { id: "home", label: "Logistics", href: "/customer", icon: IconTruckDelivery },
  {
    id: "packages",
    label: "Packages",
    href: "/customer/packages",
    icon: IconPackage,
  },
  { id: "procurement", label: "Procurement", href: "/customer/procurement", icon: IconClipboardList },
  { id: "quote", label: "Quote", href: "/customer/estimate", icon: IconCalculator },
  { id: "account", label: "Account", href: "/customer/profile", icon: IconUser },
]

/** Marketplace catalog, cart, checkout, and shop order history. */
const SHOP_PREFIXES = [
  "/customer/shop",
  "/customer/marketplace",
  "/customer/orders",
  "/customer/verify_order_payment",
  "/customer/payments/transfer",
] as const

/** Logistics: packages, shipments, warehouse, and shipment-related payments. */
const PACKAGES_PREFIXES = [
  "/customer/packages",
  "/customer/all_packages",
  "/customer/add_package",
  "/customer/waiting_to_be_stored",
  "/customer/waiting_to_be_released",
  "/customer/request_mail",
  "/customer/warehouse_address",
  "/customer/orders_shipped",
  "/customer/payment_receipts",
  "/customer/pending_payments",
  "/customer/verify_payment",
  "/customer/payments/transfer",
] as const

/** Profile, address, and account settings. */
const ACCOUNT_PREFIXES = [
  "/customer/profile",
  "/customer/edit_profile",
  "/customer/my_address",
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

/**
 * Highlights the correct sidebar tab on nested portal routes.
 *
 * Route map (all `/customer` pages):
 * - home (Logistics): `/customer`, `/customer/announcements/*`
 * - quote: `/customer/estimate`
 * - shop: `/customer/shop`, `/customer/marketplace/*`, `/customer/orders/*`, `/customer/verify_order_payment`
 * - packages: packages hub, add/request/track flows, shipment payments
 * - account: profile, edit profile, delivery address
 */
export function resolvePortalNavId(pathname: string): PortalNavId {
  if (pathname === "/customer" || pathname.startsWith("/customer/announcements")) {
    return "home"
  }

  if (pathname.startsWith("/customer/estimate")) {
    return "quote"
  }

  if (pathname.startsWith("/customer/procurement")) {
    return "procurement"
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
