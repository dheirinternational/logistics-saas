"use client"

import { useCartStore } from "@/store/cartStore"
import { CartProduct } from "@/types/entityTypeDef"
import { BiCartAdd } from "react-icons/bi"
import { toast } from "react-toastify"

const AddToCart = (product: CartProduct) => {

    const {addProduct, cart} = useCartStore()

  return (
    <button 
    className="bg-accent-red text-white w-full py-3  rounded disabled:opacity-60 flex justify-center items-center gap-2 text-sm"
    disabled={product.quantity < 1}
    onClick={() => {
    
      const isExistingInCart: CartProduct | undefined =  cart.find( item => item.id === product.id) 
      if(isExistingInCart){
        toast.info("Product already in cart")
        return
      } 

      addProduct(product); 
      toast.success("Added to cart")
    }}
    >
        <BiCartAdd className="text-xl"/>
        {
          product.quantity < 1 ? 
          "Out of stock":
          "Add to cart"
        }
    </button>
  )
}

export default AddToCart