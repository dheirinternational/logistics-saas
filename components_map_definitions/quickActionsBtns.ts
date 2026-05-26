import type { TablerIcon } from "@tabler/icons-react"
import {
  IconShoppingCart,
  IconTruck,
  IconUsers,
} from "@tabler/icons-react"

type props = {
  link: string
  icon: TablerIcon
  title: string
}

export const buttonsProps: props[] = [
  {
    title: "Users",
    icon: IconUsers,
    link: "/admin/users",
  },
  {
    title: "Shipments",
    icon: IconTruck,
    link: "/admin/shipments",
  },
  {
    title: "Orders",
    icon: IconShoppingCart,
    link: "/admin/orders",
  },
]
