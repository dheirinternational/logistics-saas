"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import CopyWarehouseDetails from '@/components/base/CopyWarehouseDetails'
import { dummyWarehouses } from '@/types/dummyData'
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { useState } from 'react'
import { FaChevronLeft, FaUser } from 'react-icons/fa'

export default function Page() {

    const router = useRouter()

    const [filterValues, setFilterValues] = useState({
        country: "china"
    })

    const [coordinates, setCoordinates] = useState({
        coordinates: ""
    })

  return (
    <div className='h-full w-full space-y-1'>
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
                Warehouse Address
            </h1>
            <Link href={"/base/profile"} className='flex-1 flex justify-end'>
                <FaUser/>
            </Link>
        </div>

        <div className='bg-white p-4 flex gap-2'> 
            <div className='w-24 -mt-2'>
                <InputComponent
                name='country'
                type='text'
                state={filterValues}
                setState={setFilterValues}
                readonly
                select
                selectValues={["china", "nigeria"]}
                />
            </div>
            <div className='w-60 -mt-2'>
                <InputComponent
                name='coordinates'
                type='text'
                state={coordinates}
                setState={setCoordinates}
                readonly
                select
                selectValues={dummyWarehouses
                    .map( x => x.name )}
                />
            </div>
        </div>

        {/* Warehouse card */}

        <div className='bg-light p-body mx-2 rounded-lg shadow shadow-dark/10'>
            <h2 className='font-bold uppercase text-accent-red'>
                Lagos Warehouse
            </h2>
            <hr className='my-4 border border-dark/10'/>
            
            {/* Warehouse information */}
            <div className='space-y-2'>
               <CopyWarehouseDetails />
            </div>
        </div>
    </div>
  )
}
