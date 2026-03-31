"use client"

import { useCartStore } from "@/store/cartStore"
import { Product } from "@/types/entityTypeDef"

const AddToCart = (product: Product) => {

    const {addProduct} = useCartStore()

  return (
    <button 
    className="bg-accent-red text-white w-full py-3 mb-22 rounded"
    onClick={() => addProduct(product)}
    >
        Add to cart
    </button>
  )
}

export default AddToCart