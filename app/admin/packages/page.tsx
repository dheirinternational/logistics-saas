"use client"

import SearchComponent from '@/components/admin/orders/SearchComponent'
import { Table } from '@/components/admin/table/Table'
import { usePackageStore } from '@/store/incomingPackagesStore'
import { Package, PackageImage, Warehouse } from '@/types/entityTypeDef'
import { PackageStatus } from '@/types/statusTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import Image from 'next/image'
import { ChangeEvent, useEffect, useEffectEvent, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'


type FilterValues = {
    search: string
    status: PackageStatus | ""
    warehouse_id: number
}

const columnHelper = createColumnHelper<Package>()



const Page: NextPage = ({}) => {

    const {trigger, setSelectedPackage: setPackage} = usePackageStore()

    
    const [packages, setpackages] = useState<Package[]>([]);


    const [error, setError] = useState<string | null>(null)    
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
    const [filterValues, setFilterValues] = useState<FilterValues>({
        search: "",
        status: "",
        warehouse_id: 0
    })

    


    const [isModalActive, setIsModalActive] = useState(false)
    const [isDataLoading, setIsDataLoading] = useState(false)
    


    // Handle Filter Values Change
    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {value, name} = e.currentTarget
        setFilterValues( prev => ({...prev, [name]: value}))
    }

    // handle Warehouse Change
    const handleWarehouseChange = (value: number) => {
        setFilterValues(prev => ({...prev, warehouse_id: value}))
    }

    // handle status change
    const handleStatusChange = (value: PackageStatus | "") => {
        setFilterValues(prev => ({...prev, status: value}))
    }


    // Fetch Packages upon initial page load
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

    }, [trigger])

    useEffect(() => {
        console.log(filterValues.search)
    }, [filterValues.search])


    // Table column def
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
                    // setIsModalActive(true)
                    setPackage(row.original)
                }}
                >
                    view
                </button>
                {/* <span>/</span> */}
            </div>
        })
    ]


    const filteredDat = packages
        .filter( x => x.package_name.toLowerCase().includes(filterValues.search.toLowerCase()) || x.incoming_package_id.toLowerCase().includes(filterValues.search.toLowerCase()) || x.customer_code.toLowerCase().includes(filterValues.search.toLowerCase()))
        
    const filteredData = packages
        .filter( pack => Number(pack.warehouse_id) === Number(filterValues.warehouse_id))
        .filter( pack => pack.incoming_package_id.toLowerCase().includes(filterValues.search.toLowerCase()) || pack.package_name.toLowerCase().includes(filterValues.search.toLowerCase()) || pack.customer_code.toLowerCase().includes(filterValues.search.toLowerCase()))
        .filter( pack => pack.status.toLowerCase().includes(filterValues.status.toLowerCase()) )
    


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
    <Search {...{state: filterValues, handleChange: handleFilterChange, handleWarehouseChange, handleStatusChange}} />

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
                    <BeatLoader color="#3B82F6" size={8} />
                    <span className='ml-2 text-sm'>Loading Packages...</span>
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





// Search Component
const Search = ({state, handleChange, handleWarehouseChange, handleStatusChange} : {state: FilterValues, handleChange: (e: ChangeEvent<HTMLInputElement>) => void, handleWarehouseChange: (value: number) => void, handleStatusChange: (value: PackageStatus | "") => void}) => {

    // Arrays
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])


    // Selected Values 
    const [warehouseId, setWarehouseId] = useState(0)
    const [warehouseName, setWarehouseName] = useState("")


    // Fetching Data Indicators
    const [isFetchingWarehouses, setIsFetchingWarehouses] = useState(true)
    
    
    // Drop Down Indicators
    const [isWarehouseDropDownActive, setIsWarehouseDropDownActice] = useState(false)
    const [isStatusDropDownActive, setIsStatusDropDownActive] = useState(false)


    // Fetch Warehouses
    const fetchWarehouses = async () => {
        setIsFetchingWarehouses(true)
        try{
            const res = await fetch(`/api/warehouses`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setWarehouses(result.data)
            setWarehouseId(result.data[0].id)
        }


        catch(err){
            console.error("Network Error", err)
            toast.error("Could not fetch Warehouses")
        }
        finally{
            setIsFetchingWarehouses(false)
        }
    }



    // Fetch Warehouses upon initial load
    useEffect(() => {
        fetchWarehouses()
    }, [])

    // Show selected Warehouse data
    useEffect(() => {
        const warehouse = warehouses.find( x => x.id === warehouseId )
        setWarehouseName(warehouse?.name || "")
        handleWarehouseChange(warehouse?.id || 0)
    }, [warehouseId])



    return <div className="w-full p-5 bg-white rounded flex gap-8">
       
        {/* Search  */}
        <div className='max-w-50 min-w-50 flex-1'>
            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Search
                </span>
                <input 
                type="text" 
                name="search" 
                className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                value={state.search}
                onChange={handleChange}
                required
                placeholder='Input Package Name, Id or customer code'
                />
            </label>
        </div>

        
        {/* Warehouse filter */}
        <div className='max-w-50 min-w-50 flex-1'>
            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Warehouse
                </span>
                <input 
                type="number" 
                name="warehouse_id" 
                className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                value={warehouseId}
                // onChange={handleChange}
                min={0}
                required
                readOnly
                />

                <div className="absolute right-1 bottom-2">
                    <button
                    className={`${isWarehouseDropDownActive && "rotate-180"} p-1`}
                    onClick={() => {setIsWarehouseDropDownActice(!isWarehouseDropDownActive)}}
                    type="button"
                    
                    >
                        <FaChevronDown />
                    </button>

                    <div className={`
                        absolute right-0 top-10 p-3 w-40 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto
                        ${!isWarehouseDropDownActive && "opacity-0 pointer-events-none translate-y-6"}    
                    `}>
                        {
                            warehouses.map( (warehouse, i) => 
                                {
                                return <button
                                    key={warehouse.id}
                                    className={`
                                        py-3 
                                        ${state.warehouse_id === warehouse.id && "bg-dark text-white rounded"}
                                        ${i !== warehouses.length - 1 && "border-b border-dark/8"}
                                    `}
                                    onClick={() => {
                                        setWarehouseId(warehouse.id)
                                        handleWarehouseChange(warehouse.id)

                                        setIsWarehouseDropDownActice(false)
                    
                                    }}
                                    type="button"
                                    >
                                        {warehouse.name}
                                    </button>
                                }
                            )
                        }
                    </div>
                </div>

                {/* Overlay */}
                    <div className="bg-light w-[84%] absolute bottom-2 left-2 whitespace-nowrap  overflow-hidden">
                        {warehouseName}
                    </div>
            </label>
        </div>



        {/* Status */}
        <div className='max-w-50 min-w-50 flex-1'>
            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Status
                </span>
                <input 
                type="text" 
                name="status" 
                className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                value={state.status}
                // onChange={handleChange}
                required
                readOnly
                />

                <div className="absolute right-1 bottom-2">
                    <button
                    className={`${isStatusDropDownActive && "rotate-180"} p-1`}
                    onClick={() => {setIsStatusDropDownActive(!isStatusDropDownActive)}}
                    type="button"
                    
                    >
                        <FaChevronDown />
                    </button>

                    <div className={`
                        absolute right-0 top-10 p-3 w-40 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto
                        ${!isStatusDropDownActive && "opacity-0 pointer-events-none translate-y-6"}    
                    `}>
                        {
                            [ "", "stored", "requested_for", "assigned_to_shipment", "delivered"].map( (status, i, array) => 
                                {
                                return <button
                                    key={status}
                                    className={`
                                        py-3 
                                        ${state.status === status && "bg-dark text-white rounded"}
                                        ${i !== array.length - 1 && "border-b border-dark/8"}
                                    `}
                                    onClick={() => {
                                        handleStatusChange(status as PackageStatus | "")

                                        setIsStatusDropDownActive(false)
                    
                                    }}
                                    type="button"
                                    >
                                        {status === "" ? "-- none --" : status}
                                    </button>
                                }
                            )
                        }
                    </div>
                </div>
            </label>
        </div>

        

    </div>
}


export default Page