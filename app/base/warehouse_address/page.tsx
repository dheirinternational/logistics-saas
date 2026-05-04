"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import CopyWarehouseDetails from '@/components/base/CopyWarehouseDetails'
import { User, Warehouse } from '@/types/entityTypeDef'
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

interface UserDetails extends User {
    code: string
}

export default function Page() {

    const router = useRouter()

    const [filterValues, setFilterValues] = useState<{id: string}>({id: ""})
    // const [coordinates, setCoordinates] = useState({coordinates: ""})
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [error, setError] = useState("")
  

    const [userDetails, setUserDetails] = useState<UserDetails | null>()

    // Loading indicators
    const [loading, setLoading] = useState(true)
    const [isFetchingUserDetails, setIsFetchingUserDetails] = useState(false)

    // Fetch Warehouses
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
            setWarehouses(result.data.filter( (x: Warehouse) => !x.manager_id ))
        }
        catch(err){
            console.error(err)
            setError("An error occurred. Please try again.")
        }
        finally{
            setLoading(false)
        }
    
    }


    // Fetch User Details
    const fetchUserDetails = async () => {
        setIsFetchingUserDetails(true)
        try{
            const res = await fetch(`/api/users/my-data`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return 
            }

            setUserDetails(result.data)
        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingUserDetails(false)
        }
    }

    useEffect(() => {
        fetchWarehouses()
        fetchUserDetails()
    }, [])

    const currentlySelectedWarehouse = warehouses.find( warehouse => warehouse.id.toString().includes(filterValues.id))
    const warehouseMapSelectValues = warehouses.map((x) => ({name: x.name, value: x.id.toString()}))

  return (
    <div className='h-full w-full space-y-1 '>
        {
        loading && isFetchingUserDetails ? 
        <div className='flex h-full w-full center-items'>
            <BeatLoader color='#f26430' size={8} speedMultiplier={0.5}/>
        </div> :
        <>
            <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
                <button 
                className='flex gap-2 flex-1 justify-start'
                onClick={() => {router.back()}}
                >
                    <span className='text-xs font-semibold'>
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
                <div className='w-60 -mt-2'>
                    <InputComponent
                    name='id'
                    type='number'
                    state={filterValues}
                    setState={setFilterValues}
                    readonly
                    select
                    selectValues={warehouseMapSelectValues}
                    overshadow
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
                <CopyWarehouseDetails title='Address' text={`${currentlySelectedWarehouse?.country === "CN" ? "China" : "Nigeria"}, ${currentlySelectedWarehouse?.province || ""}, ${currentlySelectedWarehouse?.city || ""}, ${currentlySelectedWarehouse?.district || ""}, ${currentlySelectedWarehouse?.street || ""}, ${currentlySelectedWarehouse?.building || ""}  ${userDetails?.code}`}  />
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
