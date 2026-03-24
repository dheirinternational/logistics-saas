import { IconType } from "react-icons"
import { FaUser, FaWarehouse } from "react-icons/fa"
import { LuPackage } from "react-icons/lu"
import { MdDashboard } from "react-icons/md"

export type NavLink = {
    name: string
    path: string
    logo: IconType
} 

export const navLinks: NavLink[] = [
    {
        name: "Dashboard",
        path: "/admin",
        logo: MdDashboard
    },
    {
        name: "Shipments",
        path: "/admin/shipments",
        logo: LuPackage
    },
    {
        name: "Users",
        path: "/admin/users",
        logo: FaUser
    },
    {
        name: "Warehouses",
        path: "/admin/warehouses",
        logo: FaWarehouse
    },
] 