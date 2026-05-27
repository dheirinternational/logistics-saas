"use client"

import { useEffect, useState } from "react"
import InputComponent from "../../admin/shipments/InputComponent"
import Link from "next/link"
import { FaCartShopping } from "react-icons/fa6"
import { useCartStore } from "@/store/cartStore"
import Image from "next/image"
import { toast } from "@/lib/ui/toast"
import { Product } from "@/types/entityTypeDef"
import { DheirLoader } from "@/components/ui/DheirLoader"

const MarketSearch = () => {

    const {cart} = useCartStore()
    const cartItemCount = cart.length



    const [isInputFocused, setIsInputFocused] = useState(false)
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isFetchingSearchResult, setIsFetchingSearchResult] = useState(false)

    
    
    useEffect(() => {

        if(!searchQuery.trim()) return

        const controller = new AbortController()
        const signal = controller.signal

        const fetchProducts = async () => {
            setIsFetchingSearchResult(true)
            try{
                const res = await fetch(`/api/products?search=${searchQuery}`, {
                    signal
                })

                const result = await res.json()
        
                if(!res.ok){
                    toast.error(result.message)
                    return
                }
        
                setSearchResults(result.data)
            }
            catch(err: any){            
                if (err.name === "AbortError") {
                // silently ignore aborted requests
                    return
                }
                toast.error("ERR:: Fetching Products")
                console.error("ERR:: Fetching Products", err)
            }
            finally{
                setIsFetchingSearchResult(false)
            }
        }

        fetchProducts()

        if (!signal.aborted) {
            setIsFetchingSearchResult(false)
        }

        return () => {
            controller.abort()
        }
       
    }, [searchQuery])



  return (
    <div className="px-body py-2 flex items-center gap-2 justify-between relative z-1000 ">
        
        {/* Logo */}
        <figure className="h-13 w-13 bg-amber-50 relative rounded-full z-100">
            <Image 
            src={`/Dheir-logo.png`}
            alt="company logo"
            fill
            className="object-cover dheir-logo-img dheir-logo-img--invert"
            />
        </figure>

        {/* Search Bar */}

        <div className={`
            absolute left-1/2 top-1 -translate-x-1/2 p-2 rounded-3xl transition-all duration-300 overflow-hidden max-sm:w-94 max-sm:rounded-t-none
            ${isInputFocused ? "bg-light h-90 min-h-90 max-h-90 shadow shadow-dark/10" : "bg-transparent  h-16 min-h-16 max-h-16"}
        `}>
            <div className="max-sm:absolute relative max-sm:left-1/2 max-sm:top-8 max-sm:-translate-1/2 w-fit ">
                <input 
                type="text" 
                placeholder="Search for products..." 
                className="outline-0 bg-light w-120 h-12 text-xs border border-dark/30 rounded-full py-2 px-4 max-sm:w-40"
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                value={searchQuery}
                onChange={(e) => {setSearchQuery(e.currentTarget.value)}}
                />

                {/* <button className="text-white bg-accent-red/80 text-xs h-10 outline-0 w-20 rounded-full absolute right-1 top-1">
                    Search
                </button> */}
            </div>
            <div className="h-30 border-t mt-4 border-dark/10 text-[10px] max-sm:mt-14">
                {
                    isFetchingSearchResult ? 
                        <div className="center-items py-5">
                            <DheirLoader color="orange" size={8}/>
                        </div>
                    : (!searchQuery.trim() ? ( 
                        <p className="text-dark/50 mt-4 italic">Search products...</p> 
                    
                    ) :
                    searchResults.length === 0 ? (
                        <p className="text-dark/50 mt-4 italic">No search results...</p>
                    ) : searchResults.map( (result, i) => 
                        <Link
                        key={result.id}
                        href={`/customer/marketplace/${result.id}`}
                        className={`
                            block p-2 px-4 hover:bg-dark/5
                            ${i !== searchResults.length - 1 && "border-b border-dark/10" }
                        `}
                        > 
                            {result.name}
                        </Link>
                    ))

                }   
            </div>
        </div>

        {/* Cart */}

        <Link href={"/customer/marketplace/cart"} className="relative">
          <FaCartShopping className="text-xl"/>
          {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                </span>
            )}
        </Link>
    </div>
  )
}

export default MarketSearch