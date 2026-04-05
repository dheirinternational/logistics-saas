"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";


const pages = [
    {
        name: "Incoming",
        link: "/admin/shipments"
    },
    {
        name: "Requests",
        link: "/admin/shipments/requests"
    },
    {
        name: "Accepted",
        link: "/admin/shipments/accepted_shipments"
    }
]

export default function ShipmentsLayouts({children}: {children:ReactNode}){

    const pathName = usePathname()

    return(
        <div className='max-h-[calc(100dvh-56px)] h-[calc(100dvh-56px)] overflow-y-auto p-body space-y-4 relative'>
            {!pathName.includes("/admin/shipments/create_shipment") &&<div className="text-xs space-x-2 relative z-500">
                {
                    pages.map( x => 
                        <Link 
                        key={x.name} 
                        href={x.link} 
                        className={`z-50 relative border border-dark/20 rounded px-3 py-1
                        ${pathName === x.link && "bg-white"}
                        `}>
                            {x.name}
                        </Link>
                    )
                }
            </div>}
            {children}
        </div>
    )
}