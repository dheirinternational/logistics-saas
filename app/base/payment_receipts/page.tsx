"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { Payment } from '@/types/entityTypeDef'
import { PaymentStatus } from '@/types/statusTypes'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = ({}) => {

    type Filter = {
        trackingId: string
        status: PaymentStatus | ""
    }

    const [filterValues, setFilterValues] = useState<Filter>({
        trackingId: "",
        status: ""
    })
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [payments, setPayments] = useState<Payment[]>([])

    useEffect(() => { 

        async function fetchPayments(){
            setIsDataLoading(true)
            try{
                const res = await fetch("/api/payments/user")
                const result = await res.json()

                if(!res.ok){ 
                    console.error("Error Fetching Payments", result)
                    return
                }

                setPayments(result.data)
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

    const router = useRouter()

  return <div className='h-full w-full space-y-2'>
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
            Shipment Payment
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>



    <div className='bg-white p-4 flex flex-col gap-2'> 
        <div className='flex items-center text-xs gap-1 -mt-2'>
            <InputComponent
            name='incoming_tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Tracking Number Id...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white rounded'>
                Search
            </button>
        </div>

    </div>




    <div className='bg-light p-4 min-h-150 space-y-2'>
        
        {
            isDataLoading ? 
            <div className='flex justify-center py-5'>
                <BeatLoader color='#f26430' size={10}/>
            </div>
            :
            <>
                {
                    payments.length < 1 && 
                    <p className='text-xs italic'>
                        ...No Payment receipts 
                    </p>
                }
                
                {
                    payments.map( x => 
                    <div key={x.shipment_tracking_number} className='border border-dark/20 p-4 py-3 space-y-2 rounded'>
                        <div className='flex items-center justify-between'>
                            <p className='text-sm border border-dark/20 px-2 py-1 rounded bg-accent-blue/10 w-40'>
                                {x.transaction_ref}
                            </p>
                            <div className='py-1 w-fit rounded-full h-fit'>
                                <span className={`text-[10px] block 
                                    ${x.status === "paid" ? "bg-green-100 text-green-800" 
                                    : x.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                                    "bg-red-100 text-red-800"} py-1 px-3 rounded-full`}>
                                    {x.status}
                                </span>
                            </div>
                        </div>

                        <div className='text-xs flex items-center'>
                            <div className='text-[10px] border border-dark/20 px-2 py-1 rounded w-fit '>
                                <p className='whitespace-nowrap'>
                                    Amount: ${x.amount}K
                                </p>

                                <p className='whitespace-nowrap '>
                                    method: {x.channel}
                                </p>

                                <p className='whitespace-nowrap'>
                                    {x.created_at.slice(0, 10)}
                                </p>
                            </div>
                            <div className='flex-1'>
                                <hr className='border-px border-dark/20'/>
                            </div>
                        </div>
                    </div>
                )}
            </>
        }
    </div>

  </div>
}

export default Page