"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { Shipment } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = () => {

    const [filterValues, setFilterValues] = useState({
        tracking_id: "" 
    })
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [shipments, setShipments] = useState<Shipment[]>([])

    useEffect(() => {
        const fetchShipments = async() => {
            setIsDataLoading(true)
            try{
                const res = await fetch("/api/shipments/user")
                const result = await res.json()
                
                if(!res.ok){
                    toast.error(result.message)
                }

                setShipments(result.data)
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

    const data = shipments.filter( x => x.tracking_number.toLowerCase().includes(filterValues.tracking_id.toLowerCase()))

    
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
        <h1 className='font-semibold text-sm'>
            Shipment Shipped
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>

    {
    isDataLoading ? 
    <div className='flex justify-center'>
        <BeatLoader color='#f26430' size={10}/>
    </div>
    :
    <>
        <div className='bg-white p-4 flex flex-col gap-2 md:max-w-150 md:mx-auto'> 
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

        <div className='bg-light px-4 py-2 md:max-w-150 md:mx-auto'>
            <span className='text-xs'>
                Shipments: <span className='text-accent-red font-bold text-sm'>{data.length}</span> 
            </span>
        </div>

        <div className='bg-light p-4 max-h-94 overflow-auto space-y-3 md:max-w-150 md:mx-auto'>
            {
                data.length < 1 && 
                <p className='text-xs italic'>
                    ...You have not made a shipping request 
                </p>
            }
            
            {
                data.map( x =>  
                     <div key={x.tracking_number} className='border border-dark/20 p-4 py-3 space-y-2 rounded'>
                        <div className='flex items-center justify-between'>
                            <p className='text-sm border border-dark/20 px-3 py-1 w-50 rounded-full'>
                                {x.tracking_number}
                            </p>
                            <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                                <span className='text-[10px] text-accent-blue block'>
                                    {x.status}
                                </span>
                            </div>
                        </div>

                        <div className='text-xs flex justify-between'>
                            
                            <div className='flex gap-1 flex-col text-[10px] border border-dark/20 rounded p-2 w-45'>
                                <p className='flex-1 pr-3 whitespace-nowrap flex justify-start border-dark/20'>
                                    Destination: Warehouse Lagos
                                </p>

                                <p className='flex-1 whitespace-nowrap flex'>
                                    {x.created_at.slice(0, 10)}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    </>}
  </div>
}

export default Page