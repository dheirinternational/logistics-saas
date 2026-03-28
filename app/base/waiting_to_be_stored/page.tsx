"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { dummyIncomingPackages } from '@/types/dummyData'
import { dummyWarehouses } from '@/types/dummyData'
import { useState } from 'react'

const Page: NextPage = ({}) => {

    const [filterValues, setFilterValues] = useState({
        warehouseId: dummyWarehouses[0].name,
        incomingTrackingId: "" 
    })
    const router = useRouter()

    const incomingPackage = dummyIncomingPackages[0]

  return <div className='h-full w-full space-y-1'>
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
        <h1 className='font-semibold'>
            Orders not yet in stock
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>

    <div className='bg-white p-4 flex flex-col gap-2'> 
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
            placeHolder='Tracking Number Id...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white mt-2 rounded'>
                Search
            </button>
        </div>

    </div>
    <div className='bg-light px-4 py-2'>
        <span className='text-xs'>
            Total: <span className='text-accent-red font-bold text-sm'>{dummyIncomingPackages.length}</span> incoming Packgages
        </span>
    </div>

    <div className=''>

    </div>
  </div>
}

export default Page