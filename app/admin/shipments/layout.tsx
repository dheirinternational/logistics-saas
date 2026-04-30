"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FaChevronDown, FaGlobe } from "react-icons/fa";

const pages = [
    {
        name: "expected_shipments",
        link: "/admin/shipments"
    },
    {
        name: "shipment_requests",
        link: "/admin/shipments/requests"
    },
    {
        name: "accepted_requests",
        link: "/admin/shipments/accepted_shipments"
    }
]

export default function ShipmentsLayouts({children}: {children:ReactNode}){

    const pathName = usePathname()
    const [currentPage, setCurrentPage] = useState<"expected_shipments" | "shipment_requests" | "accepted_requests" | "">("")
    const [isPageSelectorActive, setIsPageSelectorActive] = useState(false)

    // console.log(pathName)

    useEffect(() => {
        function setPageTitle(){
            switch(pathName) {
                case "/admin/shipments/requests" :
                    setCurrentPage("shipment_requests")
                    break
                case "/admin/shipments" :
                    setCurrentPage("expected_shipments")
                    break
                case "/admin/shipments/accepted_shipments" :
                    setCurrentPage("accepted_requests")
                    break
            }

        }   

        setPageTitle()
    }, [pathName])


    return(
        <div className='max-h-full h-full  relative flex'>
            <div className="p-body overflow-y-auto max-h-full h-full flex-1">
                <h2 className="text-2xl font-semibold">
                    Shipments
                </h2>
                <p className="text-xs text-dark/50 mt-2">
                    Monitor, filter, and manage all outgoing shipments from one control deck.
                </p>
                {/* {!pathName.includes("/admin/shipments/create_shipment") && <div className="text-xs space-x-2 relative z-500">
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
                </div>} */}
                <div className="mt-8 mb-6">
                    <label className='w-full flex flex-col relative max-w-70 text-xs'>
                        <span className='text-dark/80'>
                            Page
                        </span>
                        <input 
                        type="text" 
                        name="current_page" 
                        className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                        value={currentPage}
                        readOnly
                        onChange={ (e) => setCurrentPage(e.currentTarget.value as "expected_shipments" | "shipment_requests" | "accepted_requests")}
                        />
                        <FaGlobe className='absolute left-1 bottom-2.5 text-dark/60'/>
                        <div className="absolute right-1 bottom-1.5">
                            <button
                            onClick={() => setIsPageSelectorActive(prev => !prev)}
                            className={`${isPageSelectorActive && "rotate-180"} transition-set`}
                            >
                                <FaChevronDown/>
                            </button>


                            {/* LINKS */}
                            <div className={`
                                absolute right-0 top-[110%] bg-light shadow shadow-dark/20 p-2 z-1000 rounded w-40 transition-set flex flex-col gap-1
                                ${!isPageSelectorActive && "opacity-0 translate-y-8 pointer-events-none"}
                            `}>
                                {
                                    pages.map( (x, i) => 
                                        <Link 
                                        key={x.name} 
                                        href={x.link} 
                                        className={`z-50 relative border-dark/20 px-3 py-2 text-center
                                        ${pathName === x.link && "bg-dark text-white rounded"}
                                        ${i !== 2 && "border-b"}
                                        `}
                                        
                                        onClick={() => setIsPageSelectorActive(false)}
                                        >
                                            {`${x.name.charAt(0).toUpperCase() + x.name.slice(1)}`.split("_").join(" ")}
                                        </Link>
                                    )
                                }
                            </div>
                        </div>
                    </label>
                </div>
                {children}
            </div>

            <div className=" bg-light w-70">
            </div>    
        </div>
    )
}