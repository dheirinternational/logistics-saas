import { IconType } from "react-icons"
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
    }
] 