import type { TablerIcon } from "@tabler/icons-react"
import {
  IconBuildingStore,
  IconBuildingWarehouse,
  IconCash,
  IconCurrencyNaira,
  IconLayoutDashboard,
  IconMapPin,
  IconPackage,
  IconPhotoVideo,
  IconShoppingCart,
  IconTruck,
  IconUser,
  IconUsers,
} from "@tabler/icons-react"

export type NavLink = {
  name: string
  path: string
  icon: TablerIcon
}

export const navLinks: NavLink[] = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: IconLayoutDashboard,
  },
  {
    name: "Shipments",
    path: "/admin/shipments",
    icon: IconTruck,
  },
  {
    name: "Packages",
    path: "/admin/packages",
    icon: IconPackage,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: IconUsers,
  },
  {
    name: "Warehouses",
    path: "/admin/warehouses",
    icon: IconBuildingWarehouse,
  },
  {
    name: "Marketplace",
    path: "/admin/marketplace",
    icon: IconBuildingStore,
  },
  {
    name: "Media",
    path: "/admin/media",
    icon: IconPhotoVideo,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: IconShoppingCart,
  },
  {
    name: "Payment confirmations",
    path: "/admin/payments/confirmations",
    icon: IconCash,
  },
  {
    name: "Delivery Zones",
    path: "/admin/delivery_zones",
    icon: IconMapPin,
  },
  {
    name: "Pricing List",
    path: "/admin/pricing_list",
    icon: IconCurrencyNaira,
  },
  {
    name: "Profile",
    path: "/admin/profile",
    icon: IconUser,
  },
]
