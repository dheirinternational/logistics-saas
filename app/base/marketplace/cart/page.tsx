"use client"

import CheckoutCartCard from '@/components/base/marketplace/CheckoutCartCard'
import Header from '@/components/base/marketplace/Header'
import { useCartStore } from '@/store/cartStore'
import { NextPage } from 'next'
import { useEffect } from 'react'

const Page: NextPage = () => {

    const {cart, totalPrice, resetTotal} = useCartStore()
    
    useEffect(() => {
        let initializedTotalPrice: number = 0;
        
        for(let i = 0; i < cart.length; i++){

            const price = cart[i].discount_price ? cart[i].discount_price : cart[i].price
            initializedTotalPrice += price || 0
        }

       resetTotal(initializedTotalPrice)
    }, [])

  return  <div className='h-full w-full space-y-1 text-sm'>
    <Header />
    <div className='p-body py-2 bg-light mt-2'>
        <p className='tracking-wide'>
            CART SUMMARY
        </p>
        <hr className='border border-dark/10 my-2' />
        <div className='flex justify-between'>
            <p>
                Subtotal
            </p>
            <p>
                {totalPrice}
            </p>
        </div>
    </div>
    <div className='bg-light max-h-100 h-80 overflow-hidden'>
        <p className='py-2 px-body bg-primary'>
            Cart ({cart.length})
        </p>
        <div className='px-body py-3 space-y-3'>
            {cart.map( x => 
                <CheckoutCartCard key={x.id} {...x}/>
            )}
        </div>
    </div>

    <div className='bg-light p-body'>
        <button className='bg-accent-red w-full text-white py-3 rounded'>
            CheckOut {`(${totalPrice})`}
        </button>
    </div>
  </div>
}

export default Page
