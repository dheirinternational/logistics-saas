"use client"

import { useCartStore } from "@/store/cartStore"
import { Address, CartProduct } from "@/types/entityTypeDef"
import { BiCartAdd } from "react-icons/bi"
import { toast } from "@/lib/ui/toast"

const AddToCart = ({product, address } : {product: CartProduct, address: Address | null}) => {

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
      if (!address){
        toast.error("Please add your address in your profile before adding to cart")
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