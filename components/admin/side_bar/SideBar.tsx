"use client"

import { navLinks } from "@/components_map_definitions/NavigationLinks"
import NavLink from "../NavLink"
import Link from "next/link"
import Image from "next/image"
import { useNavbarStore } from "@/store/navBarStore"

export const SideBar = () => {

    const {isSideBarActive, setIsSideBarActive} = useNavbarStore()

    
    return <div className={`
        h-dvh min-h-dvh w-50 transition-set pt-4 bg-primary z-1000
        max-sm:fixed 
        ${isSideBarActive ? "max-sm:left-0" : "max-sm:-left-full"}
    `}>
        <Link href={`/`} className="pl-3 block mb-8 max-sm:hidden">
            <figure className="h-13 w-13 relative">
                <Image 
                src="/d_heir_logo.png" 
                alt="hey" 
                fill
                className="object-cover"
                />
            </figure>
        </Link> 
        <div className="max-sm:mt-30">
            {navLinks.map( (link, i) => {

                const obj = {...link}

                return <NavLink key={i} {...obj}  />
            })}
        </div>
    </div>
}