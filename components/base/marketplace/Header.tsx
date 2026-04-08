"use client"

import { useCartStore } from "@/store/cartStore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FaChevronLeft, FaUser } from "react-icons/fa"
import { FaCartShopping } from "react-icons/fa6"

const Header = () => {

    const router = useRouter()
    const {cart} = useCartStore()
    const cartItemCount = cart.length

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

        <Link href={"/base/marketplace/cart"} className='flex-1 flex justify-end relative'>
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

export default Header