import type { TablerIcon } from "@tabler/icons-react"
import { IconMapPin, IconUserEdit } from "@tabler/icons-react"

export type PortalAccountLink = {
  id: string
  label: string
  description: string
  href: string
  icon: TablerIcon
}

/** Account-only settings — ops links live on Home, Packages, Quote, and Shop. */
export const PORTAL_ACCOUNT_LINKS: PortalAccountLink[] = [
  {
    id: "edit-profile",
    label: "Edit profile",
    description: "Name, phone, email, password, and photo",
    href: "/customer/edit_profile",
    icon: IconUserEdit,
  },
  {
    id: "my-address",
    label: "My address",
    description: "Delivery address for shipments and checkout",
    href: "/customer/my_address",
    icon: IconMapPin,
  },
]
