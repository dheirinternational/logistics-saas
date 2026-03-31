"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import RequestMailProduct from '@/components/base/RequestMailProduct'
import { dummyPackages } from '@/types/dummyData'
import { Package } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaChevronLeft, FaUser } from 'react-icons/fa'

const Page: NextPage = () => {

    const [selectedPackages, setSelectedPackages] = useState<Package[]>([])

    const [filterValues, setFilterValues] = useState({
        warehouse_id: "",
        incoming_tracking_id: "" 
    })

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
        <h1 className='font-semibold'>
            Request Mail
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
            // selectValues={["Warehouse one", "warehouse 2"]}
            />
        </div>
        <div className='flex items-center text-xs gap-1 -mt-2'>
            <InputComponent
            name='incoming_tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Tracking Id...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white mt-2 rounded'>
                Search
            </button>
        </div>
    </div>

    <div className='bg-light px-4 py-2'>
        <span className='text-xs'>
            Selected Packages: <span className='text-accent-red font-bold text-sm'>{selectedPackages.length}</span> 
        </span>
    </div>

    <div className='bg-light p-4 min-h-68 h-68 max-h-68 space-y-2 overflow-y-scroll'>
        {
            dummyPackages.length < 1 && 
            <p className='text-xs italic'>
                ...There are no incoming packages
            </p>
        }
        {dummyPackages.map( packag => 
            <RequestMailProduct key={packag.id} prop={packag} handlePackage={setSelectedPackages}/>   
        )}
    </div>

    <div className='p-body'>
        <button className='bg-accent-red text-white w-full text-sm py-3 rounded'>
            Request Shipment
        </button>
    </div>
  </div>
}

export default Page