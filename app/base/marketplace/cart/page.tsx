"use client"

import CheckoutCartCard from '@/components/base/marketplace/CheckoutCartCard'
import Header from '@/components/base/marketplace/Header'
import { useCartStore } from '@/store/cartStore'
import { Address } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = () => {

    const { cart } = useCartStore()

    const [isPaymentLoading, setIsPaymentLoading] = useState(false)
    const [userEmail, setUserEmail] = useState("")
    const [address, setAddress] = useState<Address | null>(null)
    const [isModalActive, setIsModalActive] = useState(false)
    const [totalPrice, setTotalPrice] = useState(0)

    const router = useRouter()

    console.log(cart)

    // Calculate total price
    useEffect(() => {
        let totalPriceCalculated = 0
        setTotalPrice(0)

        cart.forEach( item => {
            totalPriceCalculated += item.discount_price ? item.discount_price * item.amount_to_be_ordered : item.price * item.amount_to_be_ordered
        })

        setTotalPrice(totalPriceCalculated)

    }, [cart])


    // Fetch User details for Payment Initialization
    useEffect(() => {
        const fetchUserData = async() => {
            try{
                const res = await fetch("/api/users/my-data")
                const addr = await fetch("/api/addresses/user")
                const result = await res.json() 
                const addrResult = await addr.json()
                if(!res.ok){
                    toast.error(result.message)
                    return
                }   
                if(!addr.ok){
                    toast.error(addrResult.message)
                    return
                }
                setUserEmail(result.data.email)
                setAddress(addrResult.data[0])
            }
            catch(err){
                toast.error("ERR:: Fetching User Data")
                console.error("ERR:: Fetching User Data", err)
            }   
        }
        fetchUserData()
    }, [])

    // Initialize Payment with Paystack
    const initializePayment = async (amount: number) => {
    
        setIsPaymentLoading(true)
        try{
            const res = await fetch("/api/paystack-ecommerce/initialize-payment", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: userEmail,
                    amount: amount * 100,
                    metadata: {
                        products: [
                            ...(cart.map(x => 
                                ({
                                    product_id: x.id,
                                    quantity: x.quantity,
                                    price: x.discount_price ? x.discount_price : x.price
                                })
                            ))
                        ]
                    }
                })
            })
    
            const result = await res.json()
    
            if(!res.ok){
                toast.error(result.message)
                return
            }
    
            console.log("Payment Initialization Result", result)
            
            if(result.data.status){
                router.push(result.data.data.authorization_url)   
            }
        }
        catch(err){
            toast.error("ERR:: Initializing Payment")
            console.error("ERR:: Initializing Payment", err)
        }
        finally{
            setIsPaymentLoading(false)
        }

    }

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
                ₦ {totalPrice}
            </p>
        </div>
    </div>
    <div className='bg-light max-h-90 h-90 overflow-auto'>
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
        <button 
        className='bg-accent-red w-full text-white py-3 rounded ' 
        // onClick={() => initializePayment(totalPrice)} 
        onClick={() => setIsModalActive(true)}
        disabled={cart.length === 0 || isPaymentLoading}>    
            Checkout {`₦ (${totalPrice})`}
        </button>
    </div>

    {/* Modal For confirming details before payment */}
    {
    isModalActive &&
    <div className='absolute top-0 right-0 w-screen h-dvh bg-black/50 center-items'>
        <div className='bg-white w-80 p-4 rounded space-y-3'>
            <h1 className='font-semibold text-lg'>
                Confirm Order Details
            </h1>
            <p className='text-xs'>
                Please review your order details before proceeding to payment.
            </p>    
            <div className='flex items-center text-xs space-x-2'>
                <p >
                    Shipping Address:
                </p>
                
                <p className='text-xs italic '> 
                    {address?.street}, {address?.city}, {address?.state}, {address?.postal_code}
                </p>
            </div>
            <div className='flex justify-between'>
                <p>
                    Total Amount:    
                </p>
                <p className='font-bold'>
                    ₦ {totalPrice}
                </p>
                <p>
                    {/* Shipping Fee: ₦ 5,000 */}
                </p>
            </div>      
            <div className='border border-dark/20 p-3 rounded max-h-40 overflow-auto'>
                {cart.map(x => 
                    <div key={x.id} className='flex justify-between text-xs'>
                        <p> {x.name} x {x.amount_to_be_ordered } </p>
                        <p> ₦ {x.discount_price ? x.discount_price * x.amount_to_be_ordered : x.price * x.amount_to_be_ordered} </p>
                    </div>
                )}

            </div>
            <div className='flex gap-2 mt-12'>
                <button 
                className='flex-1 py-2 border border-dark rounded'
                onClick={() => setIsModalActive(false)}
                >
                    Cancel
                </button>
                <button 
                className='flex-1 py-2 bg-accent-red text-white rounded'
                onClick={() => {initializePayment(totalPrice)}}
                >
                    {isPaymentLoading ? 
                    <BeatLoader color='#FFF' size={15}/> :
                    <> 
                        Order
                    </>}
                </button>

            </div>
            
        </div>
    </div>
    }
    </div>
}

export default Page
