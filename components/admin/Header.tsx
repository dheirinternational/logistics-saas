"use client"
import Link from "next/link"
import { useState } from "react"
import NavLink from "./NavLink"
import { navLinks } from "@/components_map_definitions/NavigationLinks"
import Image from "next/image"

export const Header = () => {

    const [isMenuActive, setIsMenuActive] = useState(false)

    return(
        <header className="h-14 px-body items-center justify-between border-b border-dark/20 relative z-1080 max-sm:flex hidden">
                       
            <div className="relative max-sm:inline hidden">
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
            </div>
        </header>
    )
}