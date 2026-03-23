import Link from "next/link"
import type { NavLink } from "@/components_map_definitions/NavigationLinks"
import { usePathname } from "next/navigation"

const NavLink = ({name, path, logo: Icon}: NavLink) => {

    const pathName = usePathname()

  return (
    <Link href={path} className={`flex items-center gap-2 text-white text-xs py-3 px-3
    ${pathName === path ? "bg-white/20 font-semibold" : ""}
    `}>
        <Icon className="text-lg"/>
        {name}
    </Link>
  )
}

export default NavLink