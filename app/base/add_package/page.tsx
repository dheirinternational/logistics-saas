"use client"

import { NextPage } from 'next'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InputComponent from '@/components/admin/shipments/InputComponent'
import { useState } from 'react'

const Page: NextPage = () => {

    const router = useRouter()
    const [packageInformation, setPackageInformation] = useState({
        trackingNumber: "",
        warehouseId: "Warehouse One",
        declaredItemName: "",
        declaredQuantity: 1,
        personalNote: ""
    })

  return <div className='h-full w-full space-y-body'>
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
            Add a package
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>

    <div className='bg-white p-4 flex flex-col gap-2'>
        
        <div className='flex gap-2'>
            <div className='w-1/2'>
                <InputComponent 
                name='warehouseId'
                type='text'
                state={packageInformation}
                setState={setPackageInformation}
                readonly
                select
                selectValues={["Warehouse One", "Warehouse Two"]}
                />
            </div>
            
            <div className='w-1/2'>
                <InputComponent 
                name='declaredQuantity'
                type='number'
                state={packageInformation}
                setState={setPackageInformation}
                placeHolder='Quantity'
                />        
            </div>
        </div>

        <InputComponent 
        name='declaredItemName'
        type='text'
        state={packageInformation}
        setState={setPackageInformation}
        placeHolder='Input Package Name...'
        />

        <InputComponent 
        name='trackingNumber'
        type='text'
        state={packageInformation}
        setState={setPackageInformation}
        placeHolder='Input Tracking Number...'
        />
    </div>
    
    <div className='bg-white p-4 flex flex-col gap-2'>
        <InputComponent 
        title='Customer Personal Note'
        name='personalNote'
        type='text'
        state={packageInformation}
        setState={setPackageInformation}
        placeHolder='customer personal note...'
        textarea
        />
    </div>

    <div className='p-body'>
        <button className='bg-accent-red text-white text-xs py-3 w-full rounded'>
            Submit
        </button>
    </div>
  </div>
}

export default Page