import type { TablerIcon } from "@tabler/icons-react"
import {
  IconBox,
  IconCreditCard,
  IconInbox,
  IconPackage,
  IconPackageImport,
  IconReceipt,
  IconShoppingBag,
  IconClipboardList,
  IconTruck,
  IconTruckDelivery,
} from "@tabler/icons-react"

export type PortalHomeCountKey =
  | "waiting_to_be_stored"
  | "total_packages"
  | "request_mail"
  | "shipment"
  | "pending_payments"

export type PortalHomeAction = {
  id: string
  label: string
  description: string
  href: string
  icon: TablerIcon
  countKey?: PortalHomeCountKey
  emphasis?: "primary" | "default"
}

/** Top priority — what most users need first. */
export const PORTAL_HOME_PRIORITY_ACTIONS: PortalHomeAction[] = [
  {
    id: "add-package",
    label: "Add package",
    description: "Register incoming tracking from China",
    href: "/base/add_package",
    icon: IconPackageImport,
    emphasis: "primary",
  },
  {
    id: "warehouse",
    label: "Warehouse address",
    description: "Copy address for your supplier",
    href: "/base/warehouse_address",
    icon: IconInbox,
    emphasis: "primary",
  },
  {
    id: "pending-payments",
    label: "Pending payments",
    description: "Pay balances to release shipment",
    href: "/base/pending_payments",
    icon: IconCreditCard,
    countKey: "pending_payments",
    emphasis: "primary",
  },
]

/** Full operations grid — moved from Account. */
export const PORTAL_HOME_QUICK_ACTIONS: PortalHomeAction[] = [
  {
    id: "waiting",
    label: "On the way",
    description: "Packages not yet in warehouse",
    href: "/base/waiting_to_be_stored",
    icon: IconPackage,
    countKey: "waiting_to_be_stored",
  },
  {
    id: "all-packages",
    label: "My packages",
    description: "Everything in your account",
    href: "/base/packages",
    icon: IconBox,
    countKey: "total_packages",
  },
  {
    id: "request-mail",
    label: "Ship my packages",
    description: "Request air, sea, or express",
    href: "/base/request_mail",
    icon: IconTruckDelivery,
  },
  {
    id: "shipment-requests",
    label: "Shipment requests",
    description: "Waiting for release",
    href: "/base/waiting_to_be_released",
    icon: IconClipboardList,
    countKey: "request_mail",
  },
  {
    id: "track",
    label: "Track shipment",
    description: "Shipments in progress",
    href: "/base#tracking",
    icon: IconTruckDelivery,
    countKey: "shipment",
  },
  {
    id: "receipts",
    label: "Payment receipts",
    description: "Past payments",
    href: "/base/payment_receipts",
    icon: IconReceipt,
  },
  {
    id: "shop-orders",
    label: "Shop orders",
    description: "Marketplace purchases",
    href: "/base/orders",
    icon: IconShoppingBag,
  },
]
