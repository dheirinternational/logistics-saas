"use client"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { useNavbarStore } from "@/store/navBarStore"

export const Header = () => {

    const {setIsSideBarActive, isSideBarActive} = useNavbarStore()


    return(
        <header className="h-14 px-body items-center justify-between border-b border-dark/20 relative z-1080 max-sm:flex hidden">
            <Link href={`/`} className="block">
                <figure className="h-13 w-13 relative">
                    <Image 
                    src="/d_heir_logo.png" 
                    alt="hey" 
                    fill
                    className="object-cover"
                    />
                </figure>
            </Link> 
            <div className="relative max-sm:inline hidden">
                <button className="space-y-1.5" onClick={() => setIsSideBarActive()}>
                    <div className={`bg-dark w-6 h-0.5 origin-left transition-set 
                        ${isSideBarActive ? "rotate-45" : ""}     
                    `}/>
                    <div className={`bg-dark  h-0.5 origin-left transition-set
                        ${isSideBarActive ? "w-0" : "w-6"}    
                    `}/>
                    <div className={`bg-dark w-6 h-0.5 origin-left transition-set 
                        ${isSideBarActive ? "-rotate-45" : ""}    
                    `}/>
                </button>
            </div>
        </header>
    )
}