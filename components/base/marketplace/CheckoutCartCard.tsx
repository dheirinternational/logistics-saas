"use client"

import { useCartStore } from "@/store/cartStore"
import { dummyProductImages } from "@/types/dummyData"
import { Product } from "@/types/entityTypeDef"
import Image from "next/image"
import { useEffect, useState } from "react"
import { FaMinus, FaPlus } from "react-icons/fa"

const CheckoutCartCard = (props: Product) => {

    const [amount, setAmount] = useState(1)
    const [previousAmount, setPreviousAmount] = useState(0)
    const productImage = dummyProductImages.filter( x => x.product_id === props.id )
    const price = props.discount_price ? props.discount_price : props.price

    const totalPrice = price * amount

    const {editTotal, resetTotal} = useCartStore()

    useEffect(() => {
        
        editTotal(totalPrice, previousAmount)
    }, [amount])

  return (
    <div className='flex'>
        <figure className='h-26 w-26 relative overflow-hidden rounded'>
            <Image 
            src={productImage[0].image_url}
            alt=''
            fill
            />
        </figure>
        <div className='px-4'>
            <p className='text-xs text-primary-text/60'>
                {props.name}
            </p>
            <p className={`text-xl font-semibold flex gap-2`}>
                <span className={`${props.discount_price && "opacity-50"} relative`}># {props.price}
                    <span className={`absolute left-0 border-dark border-b w-full top-1/2 -translate-y-1/2 ${!props.discount_price && "opacity-0"}`} />
                </span>
                {props.discount_price && "#" + props.discount_price}
            </p>
            <p className='text-xs text-primary-text/60 italic'>
                {props.stock_quantity > 0 ? "In stock" : "Out of Stock"}
            </p>
            <div className='flex items-center gap-5 mt-2'>
                <button className='p-2 rounded border-dark/20 border disabled:opacity-60'
                onClick={() => {
                    setPreviousAmount(amount * price)
                    setAmount(prev  => prev > 2 ? prev - 1 : 1)
                }}  
                disabled={amount < 2}
                >
                    <FaMinus/>
                </button>
                <span className='text-lg'>
                    {amount}
                </span>
                <button className='p-2 rounded bg-accent-red text-white disabled:opacity-60'
                onClick={() => {
                    setPreviousAmount(amount * price)
                    setAmount(prev => prev < props.stock_quantity ? prev + 1 : props.stock_quantity)
                }} 
                disabled={amount > props.stock_quantity - 1} 
                >
                    <FaPlus/>
                </button>
            </div>
        </div>
    </div>
  )
}

export default CheckoutCartCard