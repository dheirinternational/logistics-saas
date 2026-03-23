"use client"
import Link from "next/link"
import { useState } from "react"
import NavLink from "./NavLink"
import { navLinks } from "@/components_map_definitions/NavigationLinks"

export const Header = () => {

    const [isMenuActive, setIsMenuActive] = useState(false)

    return(
        <header className="h-14 px-body flex items-center justify-between border-b border-dark/20 relative z-80">
            <Link href={`/`} className="">
                .logo
            </Link>            
            <div className="relative">
                <button className="space-y-1.5" onClick={() => {setIsMenuActive(!isMenuActive)}}>
                    <div className={`bg-dark w-6 h-0.5 origin-left transition-set 
                        ${isMenuActive ? "rotate-45" : ""}     
                    `}/>
                    <div className={`bg-dark  h-0.5 origin-left transition-set
                        ${isMenuActive ? "w-0" : "w-6"}    
                    `}/>
                    <div className={`bg-dark w-6 h-0.5 origin-left transition-set 
                        ${isMenuActive ? "-rotate-45" : ""}    
                    `}/>
                </button>

                <div className={`bg-accent-red fixed h-screen min-h-dvh w-40 top-0 transition-set pt-10
                    ${isMenuActive ? "left-0" : "-left-full "}    
                `}>
                    {navLinks.map( (link, i) => <NavLink key={i} {...link}/> )}
                </div>
            </div>
        </header>
    )
}