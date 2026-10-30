import type { CTARedirectButton } from "@/components/base/CTARedirectButton"
import {
  IconBuildingWarehouse,
  IconClockHour4,
  IconMapPin,
  IconPackage,
  IconPackageImport,
  IconPackages,
  IconReceipt,
  IconSend,
  IconShoppingCart,
  IconTruck,
  IconTruckDelivery,
  IconUserEdit,
} from "@tabler/icons-react"

export const ctaButtonsProps: CTARedirectButton[] = [
  {
    title: "Request Mail",
    icon: IconTruckDelivery,
    path: "/customer/request_mail",
  },
  {
    title: "Warehouse Address",
    icon: IconBuildingWarehouse,
    path: "/customer/warehouse_address",
  },
  {
    title: "Pending Payments",
    icon: IconClockHour4,
    path: "/customer/pending_payments",
  },
]

export const profileCtaButtonsProps: CTARedirectButton[] = [
  {
    title: "Add Package",
    icon: IconPackage,
    path: "/customer/add_package",
  },
  {
    title: "Waiting To Be Received",
    icon: IconPackageImport,
    path: "/customer/waiting_to_be_stored",
  },
  {
    title: "All Packages",
    icon: IconPackages,
    path: "/customer/packages",
  },
  {
    title: "Request Mail",
    icon: IconTruckDelivery,
    path: "/customer/request_mail",
  },
  {
    title: "Shipment Requests",
    icon: IconSend,
    path: "/customer/waiting_to_be_released",
  },
  {
    title: "Shipment",
    icon: IconTruck,
    path: "/customer/orders_shipped",
  },
  {
    title: "Payment Receipts",
    icon: IconReceipt,
    path: "/customer/payment_receipts",
  },
  {
    title: "Pending Payments",
    icon: IconClockHour4,
    path: "/customer/pending_payments",
  },
  {
    title: "Orders",
    icon: IconShoppingCart,
    path: "/customer/orders",
  },
]

export const profileMenuCtaButtonsProps: CTARedirectButton[] = [
  {
    title: "Shop",
    path: "/customer/shop",
    icon: IconShoppingCart,
  },
  {
    title: "Warehouse Address",
    path: "/customer/warehouse_address",
    icon: IconBuildingWarehouse,
  },
  {
    title: "My Address",
    path: "/customer/my_address",
    icon: IconMapPin,
  },
  {
    title: "Edit profile",
    path: "/customer/edit_profile",
    icon: IconUserEdit,
  },
]

export const adminProfileMenuCtaButtonsProps: CTARedirectButton[] = [
  {
    title: "Edit profile",
    path: "/admin/edit_profile",
    icon: IconUserEdit,
  },
]
