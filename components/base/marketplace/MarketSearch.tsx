"use client"

import { useState } from "react"
import InputComponent from "../../admin/shipments/InputComponent"
import Link from "next/link"
import { FaCartShopping } from "react-icons/fa6"

const MarketSearch = () => {

    const [filterValues, setFilterValues] = useState({
        search: ""
    })

  return (
    <div className="px-body py-2 flex items-center gap-2">
        <InputComponent 
        name='search'
        type='text'
        state={filterValues}
        setState={setFilterValues}
        placeHolder="Search Product..."
        />
        
        <Link href={"/base/marketplace/cart"}>
          <FaCartShopping className="text-xl"/>
        </Link>
    </div>
  )
}

export default MarketSearch