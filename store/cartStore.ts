import { CartProduct, Product } from "@/types/entityTypeDef"
import { Carter_One } from "next/font/google"
import {create} from "zustand"

type CartStore = {
    cart: CartProduct[]
    addProduct: (product: CartProduct) => void
    removeProduct: (productId: number) => void
    totalPrice: number
    editTotal: (value: number, previousValue: number) => void
    // initializeNumber: (value: number) => void
    resetTotal: (value: number) => void
    increaseAmount: (productId: number) => void
    decreaseAmount: (productId: number) => void
}

export const useCartStore = create<CartStore>((set) => ({
    cart: [],
    totalPrice: 0,
    increaseAmount: (productId) => {
        set((state) => ({
            cart: state.cart.map( x => 
                 x.id === productId
                    ? { ...x, amount_to_be_ordered: x.amount_to_be_ordered + 1 }
                    : x
            )
        }))
    },
    decreaseAmount: (productId) => {
        set((state) => ({
            cart: state.cart.map( x =>
                x.id === productId && x.amount_to_be_ordered > 1
                    ? { ...x, amount_to_be_ordered: x.amount_to_be_ordered - 1 }
                    : x
            )
        }))
    },
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