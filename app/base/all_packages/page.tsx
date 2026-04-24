"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import StatusStatCard from '@/components/admin/StatusStatCard'
import RequestMailProduct from '@/components/base/RequestMailProduct'
import { Package } from '@/types/entityTypeDef'
import { PackageStatus } from '@/types/statusTypes'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaUser, FaWarehouse } from 'react-icons/fa'
import { GiShakingHands } from 'react-icons/gi'
import { MdAssignmentAdd, MdCheckCircle } from 'react-icons/md'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'


type FilterValues = {
    tracking_id: string,
    status: string
}


const Page: NextPage = () => {


    const [packages, setPackages] = useState<Package[]>([])
    const [selectedPackages, setSelectedPackages] = useState<Package[]>([])
    const [isDataLoading, setIsDataLoading] = useState(false)

    const [filterValues, setFilterValues] = useState<FilterValues>({
        tracking_id: "",
        status: "",
    })

    const router = useRouter()
    
    // Fetch Packages
    useEffect(() => {
        const fetchPackages = async () => {
            setIsDataLoading(true)
            try{
                const res = await fetch("/api/packages/user")
                const result = await res.json()

                if (!res.ok) {
                    toast.error(result.message)
                    selectedPackages.entries()
                    return
                }

                setPackages(result.data)
            }
            catch(err){
                console.error("ERR Fetching packages", err)
                toast.error("ERR fetchng packages")
                return
            }
            finally{
                setIsDataLoading(false)
            }
        }

        fetchPackages()
        
    }, [])

    const data = packages.filter( x => 
        (x.incoming_package_id.toLowerCase().includes(filterValues.tracking_id.toLowerCase()) || 
        x.package_name.toLowerCase().includes(filterValues.tracking_id.toLowerCase())) && 
        x.status.toLowerCase().includes(filterValues.status.toLowerCase()) )

  return <div className='h-full w-full space-y-2'>
    {/* Header */}
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
            All Packages
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>


    {/* Search Component */}
    <div className='bg-white p-4 flex flex-col gap-2 md:max-w-150 md:mx-auto'> 
        <div className='w-40 -mt-2'>
            <InputComponent
            name='status'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            readonly
            select
            selectValues={[
                {name: "-- none --", value: ""},
                {name: "Stored", value: "stored"},
                {name: "Requested For", value: "requested_for"},
                {name: "Assigned To Shipment", value: "assigned_to_shipment"},
                {name: "Delivered", value: "delivered"},
            ]}
            placeHolder='select package status...'
            overshadow
            />
        </div>

        <div className='flex items-center text-xs gap-1'>
            <InputComponent
            name='tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Tracking Id, package name...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white rounded'>
                Search
            </button>
        </div>
    </div>
    

    {/* Input Fields */}
    <div className='bg-light px-4 py-2 flex justify-center gap-3 md:max-w-150 md:mx-auto overflow-x-auto w-full pl-20'>
        <StatusStatCard count={packages.filter(p => p.status === "stored").length} status="stored" icon={FaWarehouse} />
        <StatusStatCard count={packages.filter(p => p.status === "requested_for").length} status="requested_for" icon={GiShakingHands} />
        <StatusStatCard count={packages.filter(p => p.status === "assigned_to_shipment").length} status="assigned_to_shipment" icon={MdAssignmentAdd} />
        <StatusStatCard count={packages.filter(p => p.status === "delivered").length} status="delivered" icon={MdCheckCircle}/>
    </div>

    <div className='bg-light p-4 min-h-90 h-90 max-h-90 space-y-2 overflow-y-scroll pb-20 md:max-w-150 md:mx-auto'>
        {
            data.length === 0 &&
            <div className='italic py-3 text-xs'>
                ...No Packages
            </div>
        }
        {
            !isDataLoading ?
            data
                .map( packag => 
                    <div key={packag.id}>
                        <RequestMailProduct prop={packag} handlePackage={setSelectedPackages}/>   
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