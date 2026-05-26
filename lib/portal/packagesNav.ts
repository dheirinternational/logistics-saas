import type { TablerIcon } from "@tabler/icons-react"
import {
  IconClipboardList,
  IconInbox,
  IconMapPin,
  IconPackageImport,
  IconTruck,
  IconTruckDelivery,
} from "@tabler/icons-react"

export type PackagesQuickLink = {
  id: string
  label: string
  href: string
  icon: TablerIcon
}

export const PACKAGES_QUICK_LINKS: PackagesQuickLink[] = [
  {
    id: "add",
    label: "Add package",
    href: "/base/add_package",
    icon: IconPackageImport,
  },
  {
    id: "ship",
    label: "Ship my packages",
    href: "/base/request_mail",
    icon: IconTruckDelivery,
  },
  {
    id: "requests",
    label: "Shipment requests",
    href: "/base/waiting_to_be_released",
    icon: IconClipboardList,
  },
  {
    id: "track",
    label: "Track shipment",
    href: "/base/orders_shipped",
    icon: IconTruck,
  },
  {
    id: "warehouse",
    label: "Warehouse address",
    href: "/base/warehouse_address",
    icon: IconMapPin,
  },
  {
    id: "incoming",
    label: "On the way",
    href: "/base/waiting_to_be_stored",
    icon: IconInbox,
  },
]
