"use client"

import SearchComponent from '@/components/admin/shipments/SearchComponent'
import ShipmentStatusStatCard from '@/components/admin/ShipmentStatusStatCard'
import { Table } from '@/components/admin/table/Table'
import { usePackageStore } from '@/store/incomingPackagesStore'
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

const Page: NextPage = () => {

    const {setSelectedPackage, trigger, resetReadOnly} = usePackageStore()
    
    const [incomingPackages, setIncomingPackages] = useState<IncomingPackage[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        warehouse_id: "",
        status: ""
    })


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
    
    }, [trigger])

    // Table Column Def
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
        columnHelper.accessor("created_at", {
            header: "Created At",
            cell: ({getValue}) => <span>{new Date(getValue()).toDateString()}</span>
        }),
        columnHelper.display({
            header: "Add Product",
            id: "add-product",
            cell: ({ row }) => {
                const item = row.original

                if (!item || typeof item.id === "undefined") {
                    return "Peyyyy"
                }

                if (item.status === "stored") return null

                return (
                    <button
                    className='underline'
                    onClick={() => {
                        resetReadOnly()
                        setSelectedPackage({
                            id: 0,
                            incoming_package_id: item.incoming_tracking_number,
                            package_name: item.declared_item_name,
                            user_id: Number(item.user_id),
                            customer_code: item.customer_code,
                            warehouse_id: Number(item.warehouse_id),
                            weight: Number(item.declared_item_weight) || 0,
                            condition: "good",
                            status: "stored",
                            received_at: "",
                            stored_at: "",
                            created_at: "",
                            amount: item.declared_item_quantity
                        })
                    }}
                    >
                        Add
                    </button>
                )
            }
        })
    ]

    const data = incomingPackages.filter(x => x.status.toLowerCase().includes(filterValues.status.toLowerCase()) && x.warehouse_id.toString().includes(filterValues.warehouse_id))

  return <div className='space-y-body'>
    {isDataLoading ? <div className='w-full h-full center-items'>
        <BeatLoader color='#f26430' size={10}/>
    </div> :
    <>
        <div className='flex-col items-center gap-4'>
            {/* STATUS CARDS */}
            <div>
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
            <div className='bg-light flex-1 h-full rounded'>
                <SearchComponent state={filterValues} setState={setFilterValues} />
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