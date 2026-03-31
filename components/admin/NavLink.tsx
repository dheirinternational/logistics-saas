import Link from "next/link"
import type { NavLink } from "@/components_map_definitions/NavigationLinks"
import { usePathname } from "next/navigation"
import { Dispatch, SetStateAction } from "react"
import { IconType } from "react-icons"

type NavLinksProp = {
  name: string
  path: string
  logo: IconType
  setState: Dispatch<SetStateAction<boolean>>
}

const NavLink = ({name, path, logo: Icon, setState}: NavLinksProp) => {

    const pathName = usePathname()
    
  const isActive = pathName === path || (path !== "/admin" && pathName.startsWith(path + "/"))

  return (
    <Link href={path} 
    className={`flex items-center gap-2 text-white text-xs py-3 px-3
    ${isActive ? "bg-white/20 font-semibold" : ""
    }
    `}
    onClick={() => {setState(false)}}
    >
        <Icon className="text-lg"/>
        {name}
    </Link>
  )
}

export default NavLink