"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FaChevronLeft, FaUser } from "react-icons/fa"
import { FaCartShopping } from "react-icons/fa6"

const Header = () => {

    const router = useRouter()

  return (
     <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
        <button 
        className='flex gap-2 flex-1 justify-start'
        onClick={() => {router.back()}}
        >
            <FaChevronLeft />
            <span className='text-xs font-semiboldd'>
                Go Back
            </span>
        </button>

        <Link href={"/base/marketplace/cart"} className='flex-1 flex justify-end'>
            <FaCartShopping className="text-xl"/>
        </Link>
    </div>
  )
}

export default Header