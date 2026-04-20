import { IconType } from "react-icons"
import { BsCart2 } from "react-icons/bs"
import { FaBoxes,  FaUsers } from "react-icons/fa"

type props = {
  link: string
  icon: IconType
  title: string
}


export const buttonsProps: props[] = [
    {
        title: "users",
        icon: FaUsers,
        link: "/admin/users"
    },
    {
        title: "shipments",
        icon: FaBoxes,
        link: "/admin/shipments"
    },
    {
        title: "Orders",
        icon: BsCart2,
        link: "/admin/shipments"
    }
]