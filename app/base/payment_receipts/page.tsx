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
        tracking_id: string
        status: PaymentStatus | ""
    }

    const [filterValues, setFilterValues] = useState<Filter>({
        tracking_id: "",
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

    const data = payments.filter( x => x.shipment_tracking_number.toLowerCase().includes(filterValues.tracking_id.toLowerCase()) && x.status === filterValues.status )


  return <div className='h-full w-full space-y-2'>
    <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
        <button 
        className='flex gap-2 flex-1 justify-start'
        onClick={() => {router.back()}}
        >
            <span className='text-xs font-semibold'>
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



    <div className='bg-white p-4 flex flex-col gap-2 md:max-w-150 md:mx-auto'> 
        <div className='flex items-center text-xs gap-1 '>
            <InputComponent
            name='tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Tracking Number Id...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white rounded'>
                Search
            </button>
        </div>

        <div className='flex items-center text-xs gap-1 max-w-30'>
            <InputComponent
            name='status'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Select Status'
            readonly
            select
            selectValues={[{name: "Pending", value: "pending" }, { name: "Paid", value: "paid"}]}
            overshadow
            />
            
        </div>

    </div>




    <div className='bg-light p-4 min-h-150 space-y-2 md:max-w-150 md:mx-auto'>
        
        {
            isDataLoading ? 
            <div className='flex justify-center py-5'>
                <BeatLoader color='#f26430' size={10}/>
            </div>
            :
            <>
                {
                    data.length < 1 && 
                    <p className='text-xs italic'>
                        ...No Payment receipts 
                    </p>
                }
                
                {
                    data.map( x => 
                    <div key={x.shipment_tracking_number} className='border border-dark/20 p-4 py-3 space-y-2 rounded relative'>
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
                                    Amount: ₦{x.amount}K
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
                            <div className='absolute bottom-2 right-2'>
                                {x.shipment_tracking_number}
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