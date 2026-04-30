"use client"

import { navLinks } from "@/components_map_definitions/NavigationLinks"
import NavLink from "../NavLink"
import Link from "next/link"
import Image from "next/image"

export const SideBar = () => {

    
    return <div className={`h-dvh min-h-dvh w-50 transition-set pt-4 `}>
        <Link href={`/`} className="pl-3 block mb-8">
            <figure className="h-13 w-13 relative">
                <Image 
                src="/d_heir_logo.png" 
                alt="hey" 
                fill
                className="object-cover"
                />
            </figure>
        </Link> 
        <div>
            {navLinks.map( (link, i) => {

                const obj = {...link}

                return <NavLink key={i} {...obj}  />
            })}
        </div>
    </div>
}