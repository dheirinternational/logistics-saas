"use client"

import { useCartStore } from "@/store/cartStore"
import { dummyProductImages } from "@/types/dummyData"
import { CartProduct } from "@/types/entityTypeDef"
import Image from "next/image"
import { FaMinus, FaPlus } from "react-icons/fa"

const CheckoutCartCard = (props: CartProduct) => {

    const productImage = dummyProductImages.filter( x => x.product_id === props.id )


    const { removeProduct, increaseAmount, decreaseAmount} = useCartStore()


    console.log(props)

  return (
    <div className='flex relative'>
        <figure className='h-26 w-26 relative overflow-hidden rounded'>
            <Image 
            src={props.image}
            alt=''
            fill
            />
        </figure>
        <div className='px-4'>
            <p className='text-xs text-primary-text/60'>
                {props.name}
            </p>
            <p className={`text-xl font-semibold flex gap-2`}>
                <span className={`${props.discount_price && "opacity-50"} relative`}>
                    ₦ {props.price}
                    <span className={`absolute left-0 border-dark border-b w-full top-1/2 -translate-y-1/2 ${!props.discount_price && "opacity-0"}`} />
                </span>
                {props.discount_price && "₦" + props.discount_price}
            </p>
            <p className='text-xs text-primary-text/60 italic'>
                {props.quantity > 0 ? "In stock" : "Out of Stock"}
            </p>
            <div className='flex items-center gap-5 mt-2'>
                
                <button className='p-2 rounded border-dark/20 border disabled:opacity-60'
                onClick={() => {
                    decreaseAmount(props.id)
                }}  
                disabled={props.amount_to_be_ordered < 2}
                >
                    <FaMinus/>
                </button>
                
                <span className='text-lg'>
                    {props.amount_to_be_ordered}
                </span>

                <button className='p-2 rounded bg-accent-red text-white disabled:opacity-60'
                onClick={() => {
                    increaseAmount(props.id)
                }} 
                disabled={props.amount_to_be_ordered === props.quantity - 1} 
                >
                    <FaPlus/>
                </button>
            </div>
        </div>
        <div>
            <button 
                className='p-2 rounded text-accent-red disabled:opacity-60 text-xs absolute right-2 top-2'
                onClick={() => removeProduct(props.id)}
            >
                Remove
            </button>
        </div>
    </div>
  )
}

export default CheckoutCartCard