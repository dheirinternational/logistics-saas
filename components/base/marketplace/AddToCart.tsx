"use client"

import { useCartStore } from "@/store/cartStore"
import { CartProduct } from "@/types/entityTypeDef"
import { toast } from "react-toastify"

const AddToCart = (product: CartProduct) => {

    const {addProduct, cart} = useCartStore()

  return (
    <button 
    className="bg-accent-red text-white w-full py-3 mb-22 rounded"
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
        Add to cart
    </button>
  )
}

export default AddToCart