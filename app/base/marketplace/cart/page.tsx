"use client"

import CheckoutCartCard from '@/components/base/marketplace/CheckoutCartCard'
import Header from '@/components/base/marketplace/Header'
import { calculateDeliveryZonePrice } from '@/lib/calculators/calculateDeliveryZonePrice'
import { useCartStore } from '@/store/cartStore'
import { Address, DeliveryZones, State } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = () => {

    const { cart } = useCartStore()

    const [isPaymentLoading, setIsPaymentLoading] = useState(false)
    const [userEmail, setUserEmail] = useState("")
    const [userCode, setUserCode] = useState("")
    const [address, setAddress] = useState<Address | null>(null)
    const [isModalActive, setIsModalActive] = useState(false)
    const [totalPrice, setTotalPrice] = useState(0)
    const [alternateAddress, setIsAlternateAddress] = useState("")
    const [isStateSelectorActive, setIsStateSelectorActive] = useState(false)
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null)
    const [deliveryZonePrice, setDeliveryZonePrice] = useState(0)


    
    const [states, setStates] = useState<State[]>([])


    const [isFetchingStates, setIsFetchingStates] = useState(true)
    const [isFetchingAddress, setIsFetchingAddress] = useState(true)



    const router = useRouter()

    const fetchUserAddress = async() => {
        setIsFetchingAddress(true)
        try{
            const res = await fetch("/api/addresses/user")
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            console.log(result)
            const zonePrice = await calculateDeliveryZonePrice(result.data[0].state)
            setDeliveryZonePrice(zonePrice)
            setAddress(result.data[0])

        }
        catch(err: any){
            console.error("Error Fetching User Address", err)
            toast.error(err.message || "Error Fetching User Address")
        }
        finally{
            setIsFetchingAddress(false)
        }
    }




    // Calculate total price
    useEffect(() => {
        setTotalPrice(0)

        const totalPrice = cart.reduce((acc, item) => {
            const itemPrice = item.discount_price > 0
                ? item.discount_price
                : item.price

            return acc + (itemPrice * item.amount_to_be_ordered)
        }, 0)

        console.log("Calculated Total Price", totalPrice)

        setTotalPrice(totalPrice)
        console.log(cart)

    }, [cart])

    // Fetch User details for Payment Initialization, states and delivery zones
    useEffect(() => {
        const fetchUserData = async() => {
            try{
                const res = await fetch("/api/users/my-data")
                const result = await res.json() 
                console.log(result)

                if(!res.ok){
                    toast.error(result.message)
                    return
                }   

                setUserEmail(result.data.email)
                setUserCode(result.data.code)
            }
            catch(err){
                toast.error("ERR:: Fetching User Data")
                console.error("ERR:: Fetching User Data", err)
            }   
        }

        const fetchStates = async() => {
            setIsFetchingStates(true)
            try{
                const res = await fetch(`/api/states`)
                const result = await res.json()

                if(!res.ok){
                    toast.error(result.message)
                    return
                }

                setStates(result.data)
            }
            catch(err){
                console.error("Network Error", err)
                toast.error("Network Error")
            }
            finally{
                setIsFetchingStates(false)
            }
        }

        fetchUserAddress()
        fetchStates()
        fetchUserData()
    }, [])

    useEffect(() => {
        console.log(userCode)
    }, [userCode])

    // Initialize Payment with Paystack
    const initializePayment = async (amount: number) => {
    
        setIsPaymentLoading(true)
        try{
            const res = await fetch("/api/monnify/initialize", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: userEmail,
                    amount: amount,
                    destination_address: ` ${address?.street}, ${address?.city}, ${address?.state}, ${address?.postal_code}`,
                    cart_items: cart,
                    customer_code: userCode
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

    // Handle Input Change - address
    const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const {value, name} = e.currentTarget
        setAddress( prev => {
            if (!prev) return prev
            return ({...prev, [name]: value})
        } )
    }




  return  <div className='h-full max-h-full w-full text-sm '>
        
        <Header />

        <div className='flex h-[calc(100%-56px)] max-h-[calc(100%-56px)]'>

            <div className='flex-1 p-4 space-y-3 h-full max-h-full overflow-y-auto'>
                <div className='p-body py-2 bg-light rounded shadow shadow-dark/5'>
                    <p className='tracking-wide'>
                        CART SUMMARY
                    </p>
                    <hr className='border border-dark/5 my-2' />
                    <div className='flex justify-start gap-8 text-[10px] py-3 px-4'>
                        <p>
                            Subtotal
                        </p>
                        <p>
                            ₦ {totalPrice.toLocaleString()}
                        </p>
                    </div>
                </div>

                
                
                <div className='bg-light max-h-90 h-90 overflow-auto rounded shadow shadow-dark/5'>
                    <p className='py-2 px-body  text-xs font-semibold'>
                        Cart ({cart.length})
                    </p>
                    <div className='px-body py-3 space-y-3'>
                        {cart.map( x => 
                            <CheckoutCartCard key={x.id} {...x}/>
                        )}
                    </div>
                </div>



                <div className='bg-light p-body pb-20 hidden'>
                    <button 
                    className='bg-accent-red w-full text-white py-3 rounded ' 
                    // onClick={() => initializePayment(totalPrice)} 
                    onClick={() => setIsModalActive(true)}
                    disabled={cart.length === 0 || isPaymentLoading}>    
                        Checkout {`₦ (${totalPrice})`}
                    </button>
                </div>
            </div>



            {/* Confirm Order Details */}

            <div className='h-full border-l border-dark/10 overflow-y-auto max-h-full'>
                <div className='h-full bg-black/50 '>
                    <div className='bg-light w-80 p-4 space-y-3 h-full'>
                        <h1 className='font-semibold text-lg'>
                            Confirm Order Details
                        </h1>
                        <p className='text-[10px] text-dark/60'>
                            Please review your order details before proceeding to payment.
                        </p>    
                        {
                            isFetchingAddress ? <div className="flex p-2">
                                <BeatLoader color="orange" size={6}/>
                            </div> :
                            <div className='flex flex-col items-center text-xs space-x-2 gap-8'>
                            
                            <div className='flex text-[10px] gap-4'>

                                <label className='w-34 flex flex-col relative flex-1'>
                                    <span className='text-dark/60'>
                                        Street
                                    </span>
                                    <input 
                                    type="text" 
                                    name="street" 
                                    className='border-b border-dark/10 p-2 pl-1 outline-0 focus:border-dark transition-set pr-2'
                                    value={address?.street}
                                    onChange={handleInputChange}
                                    />
                                </label>
                                
                                <label className='w-34 flex flex-col relative flex-1'>
                                    <span className='text-dark/60'>
                                        City
                                    </span>
                                    <input 
                                    type="text" 
                                    name="city" 
                                    className='border-b border-dark/10 p-2 pl-1 outline-0 focus:border-dark transition-set pr-2'
                                    value={address?.city}
                                    onChange={handleInputChange}
                                    />
                                </label>

                            </div>                                
                            <div className='flex text-[10px] gap-4'>
    
                                <label className='w-34 flex flex-col relative flex-1'>
                                    <span className='text-dark/60'>
                                        State
                                    </span>
                                    <input 
                                    type="text" 
                                    name="state" 
                                    className='border-b border-dark/10 p-2 pl-1 outline-0 focus:border-dark transition-set pr-2'
                                    value={address?.state}
                                    onChange={handleInputChange}
                                    />

                                    <div 
                                    className={`
                                        w-full absolute -bottom-30 left-0  bg-light shadow shadow-dark/20 rounded transition-set origin-top h-30 max-h-30 p-2 overflow-y-auto
                                        ${!isStateSelectorActive && "opacity-0 pointer-events-none translate-y-6"}
                                    `}
                                    >
                                        {
                                            states.map( (state, i )=> 
                                                <button
                                                key={state.id}
                                                className={`
                                                    w-full py-1
                                                    ${i !== states.length - 1 && "border-b border-dark/6"}
                                                `}
                                                onClick={() => {
                                                    setAddress( prev => {
                                                        if(!prev) return prev
                                                        return ({...prev, state: state.name})
                                                    })
                                                    setIsStateSelectorActive(false)
                                                }}
                                                >
                                                    {state.name}
                                                </button>    
                                            )
                                            
                                        }
                                    </div>

                                    <button 
                                    onClick={() => setIsStateSelectorActive(prev => !prev)}
                                    className={`
                                        absolute right-0 bottom-2.5
                                        ${isStateSelectorActive && "rotate-180"}
                                    `}>
                                        <FaChevronDown />
                                    </button>

                                </label>

                                <label className='w-34 flex flex-col relative flex-1'>
                                    <span className='text-dark/60'>
                                        Country
                                    </span>
                                    <input 
                                    type="text" 
                                    name="country" 
                                    className='border-b border-dark/10 p-2 pl-1 outline-0 focus:border-dark transition-set pr-2'
                                    value={address?.country}
                                    onChange={handleInputChange}
                                    readOnly
                                    />
                                </label>

                            </div>                                
                            </div> 
                        }
                        
                        <div className='border-5 border-dark/20 p-3 rounded max-h-40 h-40 overflow-auto px-8'>
                            {cart.map(x => 
                                <div key={x.id} className='flex justify-between text-xs'>
                                    <p> {x.name} x {x.amount_to_be_ordered } </p>
                                    <p> ₦ {x.discount_price ? Number(x.discount_price * x.amount_to_be_ordered).toLocaleString() : Number(x.price * x.amount_to_be_ordered).toLocaleString()} </p>
                                </div>
                            )}

                        </div>


                        <div className='my-6 space-y-1'>
                            <div className='flex justify-start gap-10 text-[10px]'>
                                <p className='text-dark/70'>
                                    Delivery Fee:    
                                </p>
                                <p className=''>
                                    ₦ {Number(deliveryZonePrice).toLocaleString()}
                                </p>
                                <p>
                                    {/* Shipping Fee: ₦ 5,000 */}
                                </p>
                            </div>     
                            <div className='flex justify-start gap-10 text-[10px]'>
                                <p className='text-dark/70'>
                                    Total Amount:    
                                </p>
                                <p className=''>
                                    ₦ {Number(totalPrice + deliveryZonePrice).toLocaleString()}
                                </p>
                                <p>
                                    {/* Shipping Fee: ₦ 5,000 */}
                                </p>
                            </div>      
                        </div>   

                        <div className='flex gap-2 mt-2'>
                            <button 
                            className='flex-1 py-2 border border-dark rounded'
                            onClick={() => setIsModalActive(false)}
                            >
                                Cancel
                            </button>
                            <button 
                            className='flex-1 py-2 bg-accent-red text-white rounded'
                            onClick={() => {initializePayment(totalPrice + deliveryZonePrice)}}
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
            </div>

        </div>
    
    </div>
}

export default Page
