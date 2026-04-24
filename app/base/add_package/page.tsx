"use client"

import { NextPage } from 'next'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InputComponent from '@/components/admin/shipments/InputComponent'
import { FormEvent, useEffect, useState } from 'react'
import { Warehouse } from '@/types/entityTypeDef'
import { toast } from 'react-toastify'
import { BeatLoader } from 'react-spinners'

const Page: NextPage = () => {

    const router = useRouter()
    const [packageInformation, setPackageInformation] = useState({
        incoming_tracking_number: "",
        warehouse_id: 1,
        declared_item_name: "",
        declared_item_quantity: 1,
        customer_note: "",
        status: "expected"
    })
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [isSubmiting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        try{
            const res = await fetch("/api/incoming-packages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" 
                },
                credentials: "include",
                body: JSON.stringify(packageInformation)
            });

            const result = await res.json()

            if (!res.ok) {
                toast.error(result?.message)
                return;
            }
            
            toast.success(`Successfully Added ${packageInformation.declared_item_name}`)
            setPackageInformation({
                incoming_tracking_number: "",
                warehouse_id: 1,
                declared_item_name: "",
                declared_item_quantity: 1,
                customer_note: "",
                status: "expected"
            })
        }
        catch(err){
            console.error(err)
        }
        finally{
            setIsSubmitting(false)
        }
    }

    const fetchWarehousedata = async () => {
        try{
            const res = await fetch("/api/warehouses", {
                method: "GET",
                credentials: "include"
            })

            if(!res.ok){
                throw new Error("Error fetching warehouse data")
            }

            const data = await res.json()

            setWarehouses(data.data)
        }
        catch(err){
            console.error(err)
        }
    }

    useEffect(() => {
        fetchWarehousedata()
    }, [])

  return <div className='h-full w-full space-y-body'>
    <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
        <button 
        className='flex gap-2 flex-1 justify-start'
        onClick={() => {router.back()}}
        >
            <span className='text-xs font-semibold'>
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
    <form onSubmit={handleSubmit} className='md:flex-row'>
        <div className='bg-white p-4 flex flex-col gap-2 md:max-w-150 md:mx-auto'>
            <div className='flex gap-2 md:max-w-150'>
                <div className='w-1/2'>
                    <InputComponent 
                    name='warehouse_id'
                    type='text'
                    state={packageInformation}
                    setState={setPackageInformation}
                    readonly
                    select
                    selectValues={warehouses.map( x => ({name: x.name, value: x.id}))}
                    required
                    overshadow
                    />
                </div>
                
                <div className='w-1/2'>
                    <InputComponent 
                    name='declared_item_quantity'
                    type='number'
                    state={packageInformation}
                    setState={setPackageInformation}
                    placeHolder='Quantity'
                    required
                    />        
                </div>
            </div>

                <div className='space-y-2'>
                    <InputComponent 
                    name='declared_item_name'
                    type='text'
                    state={packageInformation}
                    setState={setPackageInformation}
                    placeHolder='Input Package Name...'
                    required
                    />

                    <InputComponent 
                    name='incoming_tracking_number'
                    type='text'
                    state={packageInformation}
                    setState={setPackageInformation}
                    placeHolder='Input Tracking Number...'
                    required
                    
                    />
                </div>
                
                <div className='bg-white p-4 flex flex-col gap-2'>
                    <InputComponent 
                    title='Customer Personal Note'
                    name='customer_note'
                    type='text'
                    state={packageInformation}
                    setState={setPackageInformation}
                    placeHolder='customer personal note...'
                    textarea
                    />
                </div>
            </div>

        <div className='p-body mx-auto w-full md:max-w-150 md:mx-auto'>
            <button 
            className='bg-accent-red text-white text-xs py-3 w-full rounded disabled:opacity-70 '
            disabled={isSubmiting}
            >
                {
                    isSubmiting ?
                    <BeatLoader color='#FFF' speedMultiplier={0.5} size={10}/> : "Submit"
                }
            </button>
        </div>
    </form>
  </div>
}

export default Page