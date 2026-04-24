"use client"

import SearchComponent from '@/components/admin/shipments/SearchComponent'
import ShipmentStatusStatCard from '@/components/admin/ShipmentStatusStatCard'
import { Table } from '@/components/admin/table/Table'
import { IncomingPackage } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BiBox } from 'react-icons/bi'
import { FaTruckMoving } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

export type SearchProps = {
    search: string,
    status: string,
    warehouse_id: string
}

const columnHelper = createColumnHelper<IncomingPackage>()

const incomingPackageColumnDef = [
    columnHelper.accessor("incoming_tracking_number", {
        header: "Tracking Id",
        cell: ({getValue}) => 
            <p className='max-w-40 w-40 whitespace-nowrap overflow-hidden text-ellipsis'>
                {getValue()}
            </p>
    }),
    columnHelper.accessor("customer_code", {
        header: "Customer Code",
        cell: ({getValue}) => getValue()
    }),
    columnHelper.accessor("declared_item_name", {
        header: "Item Name",
        cell: ({getValue}) => getValue(),
        enableColumnFilter: false
    }),
    columnHelper.accessor("declared_item_quantity", {
        header: "Quantity",
        cell: ({getValue}) => getValue(),
        enableColumnFilter: false

    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: ({getValue}) => getValue(),
        enableColumnFilter: false
    }),
    columnHelper.display({
        header: "Add Product",
        id: "add-product",
        // cell: ({row}) => 
        // {
        //     if (row.original.status === "stored") {
        //         return null 
        //     }else{
        //         return <Link href={`/admin/packages/add_package/${row.original.id ?? ""}`}
        //             className='bg-accent-blue/40 px-2 py-1 rounded text-white'
        //             >
        //                 Add 
        //             </Link>
        //     }
        // }
        cell: ({ row }) => {
            const item = row.original

            if (!item || typeof item.id === "undefined") {
                return "Peyyyy"
            }

            if (item.status === "stored") return null

            return (
                <Link
                href={`/admin/packages/add_package/${item.id}`}
                className='bg-accent-blue/40 px-2 py-1 rounded text-white'
                >
                Add
                </Link>
            )
        }
    })
]

const Page: NextPage = () => {

    const [incomingPackages, setIncomingPackages] = useState<IncomingPackage[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        warehouse_id: "",
        status: ""
    })

    // const [globalFilter, setGlobalFilter] = useState("")


    useEffect(() => {
        const fetchShipmentData = async () => {
            try{
                const res = await fetch("/api/incoming-packages", {
                    method: "GET",
                    credentials: "include"
                })

                const data = await res.json()
                
                if(!res.ok){
                    toast.error(data.message)
                    return
                }

                setIncomingPackages(data.data)
                
            }
            catch(err){
                toast.error("Cannot fetch Shipment Data")
                console.error(err)
            }
            finally{
                setIsDataLoading(false) 
            }
        }

        fetchShipmentData()
    
    }, [])


    const data = incomingPackages.filter(x => x.status.toLowerCase().includes(filterValues.status.toLowerCase()) && x.warehouse_id.toString().includes(filterValues.warehouse_id))

  return <div className='space-y-body'>
    {isDataLoading ? <div className='w-full h-[calc(100dvh-80px)] center-items'>
        <BeatLoader color='#f26430' size={20}/>
    </div> :
    <>
        <div className='p-4 bg-accent-red rounded-lg text-white'>
            <span className='text-xs opacity-80'>
                Admin/Operations
            </span>
            <h1 className='font-bold mt-4 mb-2 text-xl'>
                Manage Shipments
            </h1>
            <div>
                <p className='text-[10px] opacity-70'>
                    Monitor, filter, and manage all outgoing shipments from one control deck.
                </p>
            </div>
        </div>

        {/* ADD SHIPMENT BUTTON */}
        {/* <div className='bg-light rounded-lg '>
            <Link href={'/admin/shipments/create_shipment'} className='rounded-lg border border-dark/20 flex w-full items-center justify-center gap-3 text-sm py-3 font-bold'>
                <FaPlus/>
                Create Shipment
            </Link>
        </div> */}

        {/* STATUS CARDS */}
        <div>
            <h2 className='text-sm'>
                STATS
            </h2>
            <div className='flex my-body space-x-2 overflow-x-auto'>
                <ShipmentStatusStatCard 
                value={incomingPackages.filter(x => x.status === "expected").length}
                status='Expected'
                icon={FaTruckMoving}
                />

                <ShipmentStatusStatCard 
                value={incomingPackages.filter(x => x.status === "stored").length}
                status='Stored'
                icon={BiBox}
                />
            </div>
        </div>

        {/* SEARCH COMPONENT  */}
        <div className='bg-light'>
            <SearchComponent state={filterValues} setState={setFilterValues} />
            <div className='p-16'>
                <input 
                type="text" 
                name='status'
                />
            </div>
        </div>
        
        {/* Table */}
        <div className='bg-light p-body rounded-lg'>
            <h2 className='text-sm font-bold'>
                Shipment Records
            </h2>
            <p className='text-xs mt-2 opacity-70'>
                A live overview of all shipments in the system.
            </p>
            <div className='mt-4'>
                {
                    incomingPackages ?
                    <Table 
                    importedData={data}
                    columnDef={incomingPackageColumnDef}
                    globalFilter={filterValues.search}
                    /> : null
                }
            </div>
        </div>
    </>}
  </div>
}

export default Page