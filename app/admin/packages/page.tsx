"use client"

import SearchComponent from '@/components/admin/packages/SearchComponent'
import { Table } from '@/components/admin/table/Table'
import { Package } from '@/types/entityTypeDef'
import { PackageStatus } from '@/types/statusTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'


type FilterValues = {
    search: string
    status: PackageStatus | ""
}


const Page: NextPage = ({}) => {
    
    const [packages, setpackages] = useState<Package[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const [filterValues, setFilterValues] = useState<FilterValues>({
        search: "",
        status: ""
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
        })
    ]


    const filteredData = packages
        .filter( x => x.package_name.toLowerCase().includes(filterValues.search.toLowerCase()) || x.incoming_package_id.toLowerCase().includes(filterValues.search.toLowerCase()) || x.customer_code.toLowerCase().includes(filterValues.search.toLowerCase()))
        .filter( x => x.status === filterValues.status)
    


  return <div className=' h-full p-body'>
    <div className='p-4 bg-accent-red rounded-lg text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Manage Packages
        </h1>
        <div>
            <p className='text-[10px] opacity-70'>
                Monitor, filter, and manage all Packages from one control deck.
            </p>
        </div>
    </div>

    {/* STATUS CARDS */}
    <div className='mt-4'>
        <h2 className='text-sm'>
            STATS
        </h2>
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
  </div>
}

export default Page