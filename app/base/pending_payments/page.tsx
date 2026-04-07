"use client"

import InputComponent from "@/components/admin/shipments/InputComponent"
import { Payment, User } from "@/types/entityTypeDef"
import { PaymentStatus } from "@/types/statusTypes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaChevronLeft, FaCreditCard, FaUser } from "react-icons/fa"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function PendingPayments(){


    const [payments, setPayments] = useState<Payment[]>([])
    const [user, setUser] = useState<User | null>(null)
    const [isDataLoading, setIsDataLoading] = useState(false)


    const router = useRouter()
    type Filter = {
        tracking_id: string
        status: PaymentStatus | ""
    }

    const [filterValues, setFilterValues] = useState<Filter>({
        tracking_id: "",
        status: ""
    })


    // ! Still need work - Fetch Unpaid Payments 
    useEffect(() => {
        
        const fetchPayments = async() => { 
            setIsDataLoading(true)
            try{

                // Fetch User Data
                const userRes = await fetch("/api/users/my-data")
                const userData = await userRes.json()
                if(!userRes.ok){
                    toast.error(userData.message)
                }


                // Fetch Payments Data
                const res = await fetch("/api/payments/user")
                const result = await res.json()

                if(!res.ok){ 
                    console.error("Error Fetching Payments", result)
                    return
                }

                setPayments(result.data.filter((payment: Payment) => payment.status === "pending"))
                setUser(userData.data)


            }
            catch(err){
                console.error("Error Fetching Payments", err)
                toast.error("Error Fetching Payments")
            }
            finally{
                setIsDataLoading(false)
            }
        }

        fetchPayments()
    }, [])

    


    return(
        <div className="w-full h-full">
            <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
                <button 
                className='flex gap-2 flex-1 justify-start'
                onClick={() => {router.back()}}
                >
                    <FaChevronLeft />
                    <span className='text-xs font-semiboldd'>
                        Go Back
                    </span>
                </button>
                <h1 className='font-semibold text-xs'>
                    Pending Payments
                </h1>
                <Link href={"/base/profile"} className='flex-1 flex justify-end'>
                    <FaUser/>
                </Link>
            </div>

            <div className='bg-white p-4 flex flex-col gap-2'> 
                <div className='w-40 -mt-2'>
                    <InputComponent
                    name='warehouse_id'
                    type='text'
                    state={filterValues}
                    setState={setFilterValues}
                    readonly
                    select
                    // selectValues={["pending", "paid", "failed", "abandoned"]}
                    />
                </div>
                <div className='flex items-center text-xs gap-1 -mt-2'>
                    <InputComponent
                    name='incoming_tracking_id'
                    type='text'
                    state={filterValues}
                    setState={setFilterValues}
                    placeHolder='Tracking Number Id...'
                    />
                    <button className='h-full px-4 py-2 bg-accent-red text-white mt-2 rounded'>
                        Search
                    </button>
                </div>

            </div>

            <div className='bg-light p-4 min-h-150 space-y-2'>
                {
                    isDataLoading ? 
                    <div className='flex justify-center py-5'> 
                        <BeatLoader color="#f26430" size={15}/>
                    </div> : 
                    <>
                    {
                        payments.length < 1 && 
                        <p className='text-xs italic'>
                            ...No pending Payments
                        </p>
                    }
                    
                    {
                        payments.map( payment => 
                            <PaymentCard payment={payment} userEmail={user?.email || ""} key={payment.shipment_tracking_number}/>
                        )
                    }
                </>
                }
            </div>
        </div>
    )
}



const PaymentCard = ({ payment, userEmail }: { payment: Payment, userEmail: string }) => {

    const [isPaYmentLoading, setIsPaymentLoading] = useState(false)
    
    const router = useRouter()

    // Initialize payment on paystack
    const initializePayment = async (order_id: string, amount: number) => {

    setIsPaymentLoading(true)
    try{
        const res = await fetch("/api/paystack/initialize-payment", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: userEmail,
                amount: amount * 100,
                order_id: order_id,
                metadata: {
                    shipment_tracking_number: payment.shipment_tracking_number
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

    return(
        <div className='border border-dark/20 p-4 py-3 space-y-2 rounded'>
            <div className='flex items-center justify-between'>
                <p className='border border-dark/20 px-4 py-2 rounded-full text-xs w-fit bg-accent-red/10'>
                    {payment.shipment_tracking_number}
                </p>
                <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                    <span className='text-[10px] text-accent-blue block'>
                        {payment.status}
                    </span>
                </div>
            </div>

            <div className='text-xs flex items-end justify-between'>
                <div className="flex-col flex gap-1 border border-dark/20 rounded p-3 w-40 ">
                    <p className='whitespace-nowrap'>
                        Amount: ₦ {payment.amount}K
                    </p>

                    <p className='whitespace-nowrap'>
                        method: {payment.channel}
                    </p>

                    <p className='whitespace-nowrap'>
                        {payment.created_at.slice(0, 10)}
                    </p>
                </div>
                <button 
                disabled={isPaYmentLoading}
                className="bg-accent-blue flex gap-1 items-center h-fit px-4 py-2 text-white rounded"
                onClick={() => initializePayment(payment.shipment_tracking_number, payment.amount)}

                >
                    {
                        isPaYmentLoading ? 
                        <BeatLoader color="white" size={4}/>:
                        <>
                            <FaCreditCard/>
                            Pay
                        </>    
                    }
                </button>
            </div>
            
        </div>
    )
}