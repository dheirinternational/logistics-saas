import { IconType } from "react-icons"
import { CgProfile } from "react-icons/cg"
import { FaShip, FaWarehouse } from "react-icons/fa"
import { FaShop, FaUsers } from "react-icons/fa6"
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
        logo: FaShip
    },
    {
        name: "Packages",
        path: "/admin/packages",
        logo: LuPackage
    },
    {
        name: "Users",
        path: "/admin/users",
        logo: FaUsers
    },
    {
        name: "Warehouses",
        path: "/admin/warehouses",
        logo: FaWarehouse
    },
    {
        name: "Marketplace",
        path: "/admin/marketplace",
        logo: FaShop
    },
    {
        name: "Profile",
        path: "/admin/profile",
        logo: CgProfile
    },
] 