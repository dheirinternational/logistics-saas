"use client"

import { useState } from "react"
import InputComponent from "../../admin/shipments/InputComponent"
import Link from "next/link"
import { FaCartShopping } from "react-icons/fa6"
import { useCartStore } from "@/store/cartStore"

const MarketSearch = () => {

    const [filterValues, setFilterValues] = useState({
        search: ""
    })

    const {cart} = useCartStore()
    const cartItemCount = cart.length


  return (
    <div className="px-body py-2 flex items-center gap-2">
        <InputComponent 
        name='search'
        type='text'
        state={filterValues}
        setState={setFilterValues}
        placeHolder="Search Product..."
        />
        
        <Link href={"/base/marketplace/cart"} className="relative">
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