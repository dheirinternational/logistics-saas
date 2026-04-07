"use client"

import { ShippingRequest } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = () => {

    const [shipmentRequests, setShipmentRequests] = useState<ShippingRequest[]>([])
    const [isDataLoading, setIsDataLoading] = useState(false)

    // Fetch Shipment Requests
    useEffect(() => {
        const fetchShipmentRequests = async() => {

            setIsDataLoading(true)
            try{
                const res = await fetch(`/api/shipment-requests/user`, {
                    method: "GET",
                    credentials: "include"
                })

                const result = await res.json()
                
                if(!res.ok){
                    toast.error(result.message)
                    return
                }

                setShipmentRequests(result.data.filter((x: ShippingRequest) => x.status === "pending"))

            }
            catch(err){
                toast.error("ERR:: fetching shipments requests")
                console.error("ERR:: fetching shipments requests", err)
            }
            finally{
                setIsDataLoading(false)
            }
        }

        fetchShipmentRequests()
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
            Shipment Requests
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>

    {/* <div className='bg-white p-4 flex flex-col gap-2'> 
        <div className='w-40 -mt-2'>
            <InputComponent
            name='warehouse_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            readonly
            select
            selectValues={dummyWarehouses.map( x => x.name)}
            />
        </div>
        <div className='flex items-center text-xs gap-1 -mt-2'>
            <InputComponent
            name='incoming_tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Product Id/Product Name...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white mt-2 rounded'>
                Search
            </button>
        </div>
    </div> */}

    <div className='bg-light p-4 min-h-150 space-y-3'>
        {
            shipmentRequests.length < 1 && !isDataLoading && 
            <p className='text-xs italic'>
                ...No shipment requests 
            </p>
        }
        

        {
        !isDataLoading ?
            shipmentRequests 
                .map( request => 
                    <div key={request.id} className='border border-dark/20 p-4 py-3 space-y-2 rounded'>
                        <div className='flex items-center justify-between'>
                            <p className='text-lg'>
                                {request.channel}
                            </p>
                            <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                                <span className='text-[10px] text-accent-blue block'>
                                    {request.status}
                                </span>
                            </div>
                        </div>

                        <div className='text-xs flex'>
                            
                            <p className='flex-1 whitespace-nowrap flex justify-start border-r border-dark/20'>
                                Packages No: {request.package_ids.length}
                            </p>

                            <p className='flex-1 whitespace-nowrap flex justify-start border-r border-dark/20 px-2'>
                                Wrapping: {request.wrapping}
                            </p>

                            <p className='flex-1 whitespace-nowrap flex justify-end'>
                                {request.created_at.slice(0, 10)}
                            </p>
                        </div>
                    </div>
                ) :
                <div className='w-full h-full center-items'>
                    <BeatLoader color='#f26430' size={15}/>
                </div>
        }
        
    </div>
  </div>
}

export default Page