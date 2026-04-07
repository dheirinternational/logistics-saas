"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import StatusStatCard from '@/components/admin/StatusStatCard'
import RequestMailProduct from '@/components/base/RequestMailProduct'
import { Package } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CgAssign } from 'react-icons/cg'
import { FaCheckCircle, FaChevronLeft, FaClock, FaTruck, FaUser, FaWarehouse } from 'react-icons/fa'
import { GrDeliver } from 'react-icons/gr'
import { MdAssignmentAdd, MdCheckCircle } from 'react-icons/md'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = () => {


    const [packages, setPackages] = useState<Package[]>([])
    const [selectedPackages, setSelectedPackages] = useState<Package[]>([])
    const [isDataLoading, setIsDataLoading] = useState(false)

    const [filterValues, setFilterValues] = useState({
        warehouse_id: "",
        incoming_tracking_id: "" 
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


  return <div className='h-full w-full space-y-2'>
    {/* Header */}
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


    {/* Search Component */}
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
        <div className='flex items-center text-xs gap-1'>
            <InputComponent
            name='incoming_tracking_id'
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


    {/* Input Fields */}
    <div className='bg-light px-4 py-2 flex justify-center gap-3'>
        <StatusStatCard count={packages.filter(p => p.status === "stored").length} status="stored" icon={FaWarehouse} />
        <StatusStatCard count={packages.filter(p => p.status === "assigned_to_shipment").length} status="assigned_to_shipment" icon={MdAssignmentAdd} />
        <StatusStatCard count={packages.filter(p => p.status === "delivered").length} status="delivered" icon={MdCheckCircle}/>
    </div>

    <div className='bg-light p-4 min-h-90 h-90 max-h-90 space-y-2 overflow-y-scroll pb-20'>
        {
            !isDataLoading ?
            packages
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