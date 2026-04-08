"use client"

import Link from "next/link"
import { useState } from "react"
import { IconType } from "react-icons"
import { FaCalculator, FaHome, FaUser } from "react-icons/fa"
import { FaShop } from "react-icons/fa6"

const NavBar = () => {

    const [currentPageIndex, setCurrentPageIndex ] = useState(0)

    type NavLink = {
        icon: IconType
        path: string
    }
 
    const icons: NavLink[] = [
        {
            icon: FaHome,
            path: "/base"
        }, 
        {
            icon: FaShop,
            path: "/base/marketplace"
        }, 
        {
            icon: FaCalculator,
            path: "/base/estimate" 
        }, 
        {
            icon: FaUser,
            path: "/base/profile"
        }
    ] 

  return (
    <div className="fixed z-1000 bottom-0 left-0 h-18 w-full border-t border-dark/20 bg-light">
        <nav className="h-full w-fit mx-auto flex justify-center items-center text-xl relative gap-6">
            
            
            <div 
            className="rounded-full absolute w-21 h-21 -left-3 bg-accent-red z-10 -top-6 transition-set" 
            style={{transform: `translateX(${84 * currentPageIndex}px)`}}
            />

            {
                icons.map( (link, i) => {
                    const Icon = link.icon

                    return(
                        <Link 
                        key={i} 
                        href={link.path}
                        className={`
                            h-15 w-15 flex justify-center items-center rounded-full relative z-40 transition-set ease-out duration-600 
                            ${currentPageIndex === i ? "text-white -top-4 text-3xl" : "text-xl"}    
                        `}
                        onClick={() => {setCurrentPageIndex(i)}}
                        >
                            <Icon className=""/>
                        </Link>
                    )
                })
            }
        </nav>
    </div>
  )
}

export default NavBar