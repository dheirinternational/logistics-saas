"use client"

import InputComponent from "@/components/admin/shipments/InputComponent"
import { dummyPayments } from "@/types/dummyData"
import { PaymentStatus } from "@/types/statusTypes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FaChevronLeft, FaUser } from "react-icons/fa"

export default function PendingPayments(){

    const router = useRouter()
    type Filter = {
        tracking_id: string
        status: PaymentStatus | ""
    }

    const [filterValues, setFilterValues] = useState<Filter>({
        tracking_id: "",
        status: ""
    })


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

            <div className='bg-light p-4 min-h-150'>
                {
                    dummyPayments.length < 1 && 
                    <p className='text-xs italic'>
                        ...You have not made a shipping request 
                    </p>
                }
                
                <div className='border border-dark/20 p-4 py-3 space-y-2 rounded'>
                    <div className='flex items-center justify-between'>
                        <p className='text-lg'>
                            {dummyPayments[0].transaction_ref}
                        </p>
                        <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                            <span className='text-[10px] text-accent-blue block'>
                                {dummyPayments[0].status}
                            </span>
                        </div>
                    </div>

                    <div className='text-xs flex'>
                        
                        <p className='flex-1 whitespace-nowrap flex justify-start border-r border-dark/20'>
                        Amount: ${dummyPayments[0].amount}K
                        </p>

                        <p className='flex-1 whitespace-nowrap flex justify-start border-r border-dark/20 px-2'>
                        method: {dummyPayments[0].payment_method}
                        </p>

                        <p className='flex-1 whitespace-nowrap flex justify-end'>
                            {dummyPayments[0].created_at.slice(0, 10)}
                        </p>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}