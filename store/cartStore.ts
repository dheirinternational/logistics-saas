import { Product } from "@/types/entityTypeDef"
import {create} from "zustand"

type CartStore = {
    cart: Product[]
    addProduct: (product: Product) => void
    removeProduct: (productId: string) => void
    totalPrice: number
    editTotal: (value: number, previousValue: number) => void
    // initializeNumber: (value: number) => void
    resetTotal: (value: number) => void
}

export const useCartStore = create<CartStore>((set) => ({
    cart: [],
    totalPrice: 0,

    addProduct: (product) => {
        set( state => {
            const filtered = state.cart.filter( x => x.id !== product.id)
            return { cart: [...filtered, product] }
        })
    },
    removeProduct: (id) => {
        set((state) => ({cart: state.cart.filter(x => x.id !== id)}))
    },
    editTotal: (number, previous) => set((state) => ({
        totalPrice: previous === 0 ? state.totalPrice + number : (state.totalPrice - previous) + number 
    })),
    resetTotal: (value) => set({totalPrice: value})

}))