"use client"

import SearchComponent from '@/components/admin/orders/SearchComponent'
import { Table } from '@/components/admin/table/Table'
import { Package, PackageImage } from '@/types/entityTypeDef'
import { PackageStatus } from '@/types/statusTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { FaX } from 'react-icons/fa6'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'


type FilterValues = {
    search: string
    status: string
    warehouse_id: string
}


const Page: NextPage = ({}) => {
    
    const [packages, setpackages] = useState<Package[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
    const [isModalActive, setIsModalActive] = useState(false)
    
    const [filterValues, setFilterValues] = useState<FilterValues>({
        search: "",
        status: "",
        warehouse_id: ""
    })

    useEffect(() => {

        const fetchShipments = async () => {
            setIsDataLoading(true)
            try{
                const res = await fetch("/api/packages", {
                    method: "GET",
                    credentials: 'include'
                })

                const result = await res.json()
                
                if(!res.ok){
                    toast.error(result.message)
                    setError(result.message)
                    return
                }

                setpackages(result.data)
            }
            catch(err){
                console.error("ERR fetching packages",err)
            }
            finally{
                setIsDataLoading(false)
            }
        }

        fetchShipments()

    }, [])

    const columnHelper = createColumnHelper<Package>()

    const columnDef = [
        columnHelper.accessor("package_name", {
            header: "Name"
        }),
        columnHelper.accessor("customer_code", {
            header: "Customer Code"
        }),
        columnHelper.accessor("weight", {
            header: "Weight"
        }),
        columnHelper.accessor("warehouse_id", {
            header: "Warehouse"
        }),
        columnHelper.accessor("status", {
            header: "Status"
        }),
        columnHelper.accessor("received_at", {
            header: "Received At",
            cell: ({getValue}) => <p>{new Date(getValue()).toDateString()}</p>
        }),
        columnHelper.accessor("stored_at", {
            header: "Stored At",
            cell: ({getValue}) => <p>{new Date(getValue()).toDateString()}</p>
        }),
        columnHelper.display({
            id: "action-btns",
            cell: ({row}) => <div>
                <button
                onClick={() => {
                    setIsModalActive(true)
                    setSelectedPackage(row.original)
                }}
                >
                    view
                </button>
                {/* <span>/</span> */}
            </div>
        })
    ]


    const filteredData = packages
        .filter( x => x.package_name.toLowerCase().includes(filterValues.search.toLowerCase()) || x.incoming_package_id.toLowerCase().includes(filterValues.search.toLowerCase()) || x.customer_code.toLowerCase().includes(filterValues.search.toLowerCase()))
        .filter( x => x.status.toLowerCase().includes(filterValues.status.toLowerCase()) && x.warehouse_id.toString().includes(filterValues.warehouse_id))
    


  return <div className=' h-full '>
    <h2 className="text-2xl font-semibold">
        Packages
    </h2>
    <p className="text-xs text-dark/50 mt-2">
        Monitor, filter, and manage all outgoing shipments from one control deck.
    </p>

    {/* STATUS CARDS */}
    <div className='mt-4'>
        <div className='flex my-body space-x-2 overflow-x-auto'>
            {/* <StatusStatCard />
            <StatusStatCard />
            <StatusStatCard />
            <StatusStatCard /> */}
        </div>
    </div>

    {/* SEARCH COMPONENT  */}
    <SearchComponent state={filterValues} setState={setFilterValues} />

    {/* Table */}
    <div className='bg-light p-body rounded-lg mt-4'>
        <h2 className='text-sm font-bold'>
            Packages 
        </h2>
        <p className='text-xs mt-2 opacity-70'>
            A live record of all packages in the system.
        </p>
        <div className='mt-4'>
            {isDataLoading ? (
                <div className='flex justify-center items-center py-8'>
                    <BeatLoader color="#3B82F6" size={15} />
                    <span className='ml-2 text-sm'>Loading warehouses...</span>
                </div>
            ) : error ? (
                <div className='text-center py-8'>
                    <p className='text-red-500 text-sm'>{error}</p>
                </div>
            ) : (
                <Table 
                    importedData={filteredData}
                    columnDef={columnDef}
                    globalFilter=''
                />
            )}
        </div>
    </div>
    {
        isModalActive && selectedPackage &&
        <Modal 
        setModal={() => {setIsModalActive(false)}} 
        packag={selectedPackage}/>
    }
  </div>
}


const Modal = ({setModal, packag} : {setModal : () => void, packag: Package | null }) => {

    const [packageImages, setPackageImages] = useState<PackageImage[]>([])
    const [isImagesLoading, setIsImagesLoading] = useState(false)

    // Fetch Package Images
    useEffect(() => {
        async function fetchProductImages(){
            setIsImagesLoading(true)
            try{
                const res = await fetch(`/api/packages/images/${packag?.id}`)
                const result = await res.json()

                if(!res.ok){
                    toast.error("Error Fetching Images")
                    return
                }

                setPackageImages(result.data)
            }
            catch(err){
                console.error("Error Fetching Images", err)
            }
            finally{
                setIsImagesLoading(false)
            }
        }

        fetchProductImages()
    }, [])


  return <div className='w-screen h-dvh bg-dark/40 fixed top-0 right-0  center-items'>
        <div className='w-80 h-100 bg-light rounded p-4 relative'>
            <button 
            className='text-sm absolute right-4 top-4'
            onClick={() => {
                setModal()
            }}
            >
                <FaX />
            </button>
            {/* Product Name */}
            <div className=''>
                <h2 className='font-bold'>
                    {packag?.package_name}
                </h2>
            </div>
            <div className='h-82 overflow-y-auto mt-4 '>
                
                {/* Images */}
                <div className='h-30 bg-amber-50 flex gap-2 overflow-x-auto'>
                    {
                        isImagesLoading ? 
                        <BeatLoader color=' #f26430' size={12}/> :
                        packageImages.map( x =>  
                            <figure
                            key={x.id} 
                            className='h-30 w-30 min-w-30 overflow-hidden rounded relative border-2 border-dark/30'>
                                <Image
                                src={x.image_url}
                                alt='product-images'
                                fill
                                className='object-cover'
                                />
                            </figure>
                        )
                    }
                </div>

                {/* Price */}
                <div className='mt-4 relative'>
                    
                    <div className='text-xs flex flex-col gap-2 justify-between p-3'>
                        <p className='space-x-3 font-semibold'>Customer Code: <span className='font-normal'>{packag?.customer_code}</span></p>
                        <p className='space-x-3 font-semibold'>Incoming Package Id: <span className='font-normal'>{packag?.incoming_package_id || "nil"}</span></p>
                        <p className='space-x-3 font-semibold'>Received At:<span className='ml-2 font-normal'>{new Date(packag?.received_at || "").toDateString()}</span></p>
                        <p className='space-x-3 font-semibold'>Status:<span className='ml-2 font-normal'>  {packag?.status} </span></p>
                        <p className='space-x-3 font-semibold '>Warehouse Id:<span className='ml-2 font-normal'>{packag?.warehouse_id}</span></p>
                        <p className='space-x-3 font-semibold '>Weight:<span className='ml-2 font-normal'>{packag?.weight} kg</span></p>
                    </div>
                </div>
                    <hr className='border-dark/40 my-2'/>
                <div className='space-y-2'>
         
                </div>
                {/*  */}
            </div>
        </div>
    </div>
}

export default Page