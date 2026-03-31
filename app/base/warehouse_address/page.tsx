"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import CopyWarehouseDetails from '@/components/base/CopyWarehouseDetails'
import Map from '@/components/base/Map'
import { Warehouse } from '@/types/entityTypeDef'
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaUser } from 'react-icons/fa'
import { ClipLoader } from 'react-spinners'

export default function Page() {

    const router = useRouter()

    const [filterValues, setFilterValues] = useState({country: "china", name: ""})
    // const [coordinates, setCoordinates] = useState({coordinates: ""})
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [index, setIndex] = useState(0)

    const fetchWarehouses = async () => {
        try{
            const res = await fetch("/api/warehouses", {
                method: "GET",
                credentials: "include"    
            })

            const result = await res.json()
            console.log(result)

            if(!res.ok){
                setError(result.error || "Login failed")
                return
            }
            setWarehouses(result.data)
        }
        catch(err){
            setError("An error occurred. Please try again.")
        }
        finally{
            setLoading(false)
        }
    
    }

    useEffect(() => {
        fetchWarehouses()
    }, [])

    const currentlySelectedWarehouse = warehouses.find(x => x.name === filterValues.name)

  return (
    <div className='h-full w-full space-y-1 '>
        {
        loading ? <div className='h-full w-full center-items'>
            <ClipLoader color='#00f' size={30}/>
        </div> :
        <>
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
                {/* <div className='w-24 -mt-2'>
                    <InputComponent
                    name='country'
                    type='text'
                    state={filterValues}
                    setState={setFilterValues}
                    readonly
                    select
                    selectValues={["china", "nigeria"]}
                    />
                </div> */}
                <div className='w-60 -mt-2'>
                    <InputComponent
                    name='name'
                    type='text'
                    state={filterValues}
                    setState={setFilterValues}
                    readonly
                    select
                    // selectValues={warehouses.map((x) => x.name)}
                    />
                </div>
            </div>

            {/* Warehouse card */}

            <div className='bg-light p-body mx-2 rounded-lg shadow shadow-dark/10'>
                <h2 className='font-bold uppercase text-accent-red'>
                    {currentlySelectedWarehouse?.name}
                </h2>
                <hr className='my-4 border border-dark/10'/>
                
                {/* Warehouse information */}
                <div className='space-y-2'>
                <CopyWarehouseDetails title='Recipient' text={`${currentlySelectedWarehouse?.name || ""}`}/>
                <CopyWarehouseDetails title='Contact' text={`${currentlySelectedWarehouse?.phone || ""}`}/>
                <CopyWarehouseDetails title='Address' text={`${currentlySelectedWarehouse?.country === "CN" ? "China" : "Nigeria"}, ${currentlySelectedWarehouse?.province || ""}, ${currentlySelectedWarehouse?.city || ""}, ${currentlySelectedWarehouse?.district || ""}, ${currentlySelectedWarehouse?.street || ""}, ${currentlySelectedWarehouse?.building || ""} ${currentlySelectedWarehouse?.recipient_name || ""}`} />
                <CopyWarehouseDetails title='Postal Code' text={`${currentlySelectedWarehouse?.postal_code || ""}`}/>
                </div>
                {/* <div className='mt-6 h-75'>
                    <Map />
                </div> */}
            </div>
        </>}
    </div>
  )
}
