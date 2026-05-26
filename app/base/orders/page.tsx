"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { Order } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

const Page: NextPage = () => {

    const [filterValues, setFilterValues] = useState({
        order_id: "" 
    })
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])

    useEffect(() => {
        const fetchShipments = async() => {
            setIsDataLoading(true)
            try{
                const res = await fetch("/api/orders/user")
                const result = await res.json()
                
                if(!res.ok){
                    toast.error(result.message)
                }

                setOrders(result.data)
            }
            catch(err){
                toast.error("ERR:: Fetching Shipment Data")
                console.error("ERR:: Fetching Shipment Data", err)
            }
            finally{
                setIsDataLoading(false)
            }
        }

        fetchShipments()
    }, [])
    
    const router = useRouter()

    const data = orders.filter( x => x.order_id.toLowerCase().includes(filterValues.order_id.toLowerCase()))
    console.log(data)
    
  return <div className='h-full w-full space-y-2'>
    <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
        <button 
        className='flex gap-2 flex-1 justify-start'
        onClick={() => {router.back()}}
        >
            <FaChevronLeft />
            <span className='text-xs font-semibold'>
                Go Back
            </span>
        </button>
        <h1 className='font-semibold text-sm'>
            Orders
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>

    {
    isDataLoading ? 
    <div className='flex justify-center'>
        <DheirLoader color='#f26430' size={10}/>
    </div>
    :
    <>
        <div className='bg-white p-4 flex flex-col gap-2'> 
            <div className='flex items-center text-xs gap-1'>
                <InputComponent
                name='tracking_id'
                type='text'
                state={filterValues}
                setState={setFilterValues}
                placeHolder='Tracking Id...'
                />
                <button className='h-full px-4 py-2 bg-accent-red text-white rounded'>
                    Search
                </button>
            </div>
        </div>

        <div className='bg-light px-4 py-2'>
            <span className='text-xs'>
                Orders: <span className='text-accent-red font-bold text-sm'>{data.length}</span> 
            </span>
        </div>

        <div className='bg-light p-4 max-h-94 overflow-auto space-y-3'>
            {
                data.length < 1 && 
                <p className='text-xs italic'>
                    {"...You don't have any orders"}
                </p>
            }
            
            {
                data.map( x =>  
                     <Link 
                     href={`/base/orders/${x.order_id}`}
                     key={x.id} 
                     className='border border-dark/20 p-4 py-3 space-y-2 rounded w-full block'
                     
                     >
                        <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold border border-dark/20 px-3 py-1 w-50 rounded-full'>
                                {x.order_id}
                            </p>
                            <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                                <span className='text-[10px] text-accent-blue block'>
                                    {x.status}
                                </span>
                            </div>
                        </div>

                        <div className='text-xs flex justify-between'>
                            
                            <div className='flex gap-1 flex-col text-[10px] border border-dark/20 rounded p-2 w-[90%] max-w-[90%] overflow-hidden'>
                                <p className='flex-1 pr-3 whitespace-nowrap flex justify-start border-dark/20 w-full max-w-full overflow- truncate'>
                                    {x.destination_address}
                                </p>

                                <p className='flex-1 whitespace-nowrap flex'>
                                    {x.created_at.slice(0, 10)}
                                </p>
                            </div>
                        </div>
                    </Link>
                )
            }
        </div>
    </>}
  </div>
}

export default Page