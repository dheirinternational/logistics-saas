"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { dummyShippingRequests } from '@/types/dummyData'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaChevronLeft, FaUser } from 'react-icons/fa'

const Page: NextPage = () => {

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
            Pending Shipment Approval
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>

    {/* <div className='bg-white p-4 flex flex-col gap-2'> 
        <div className='w-40 -mt-2'>
            <InputComponent
            name='warehouseId'
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
            name='incomingTrackingId'
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

    <div className='bg-light p-4 min-h-150'>
        {
            dummyShippingRequests.length < 1 && 
            <p className='text-xs italic'>
                ...You have not made a shipping request 
            </p>
        }
        
        <div className='border border-dark/20 p-4 py-3 space-y-2 rounded'>
            <div className='flex items-center justify-between'>
                <p className='text-lg'>
                    {dummyShippingRequests[0].method}
                </p>
                <div className='bg-accent-blue/30 px-3 py-1 w-fit rounded-full h-fit'>
                    <span className='text-[10px] text-accent-blue block'>
                        {dummyShippingRequests[0].status}
                    </span>
                </div>
            </div>

            <div className='text-xs flex'>
                
                <p className='flex-1 whitespace-nowrap flex justify-start border-r border-dark/20'>
                    Packages No: {dummyShippingRequests[0].packageIds.length}
                </p>

                <p className='flex-1 whitespace-nowrap flex justify-end'>
                    {dummyShippingRequests[0].createdAt.slice(0, 10)}
                </p>
            </div>
        </div>
    </div>
  </div>
}

export default Page