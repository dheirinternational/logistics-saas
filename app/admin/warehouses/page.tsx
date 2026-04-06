"use client"

import { Table } from '@/components/admin/table/Table'
import SearchComponent from '@/components/admin/warehouse/SearchComponent'
import { Warehouse } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'


const Page: NextPage = ({}) => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const columnHelper = createColumnHelper<Warehouse>()

    const columnDef = [
        columnHelper.accessor("name", {
            header: "name"  
        }),
        columnHelper.accessor("type", {
            header: "Type"
        }),
        columnHelper.accessor("manager_id", {
            header: "Manager",
        }),
        columnHelper.accessor("phone", {
            header: "Phone"
        })
    ]

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/warehouses', {
                    credentials: 'include'
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch warehouses')
                }

                const data = await response.json()
                setWarehouses(data.data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong')
            } finally {
                setLoading(false)
            }
        }

        fetchWarehouses()
    }, [])


  return <div className='space-y-body'>
    <div className='p-4 bg-accent-red rounded-lg text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Manage Warehouses
        </h1>
        <div>
            <p className='text-[10px] opacity-70'>
                Monitor, filter, and manage all Warehouses from one control deck.
            </p>
        </div>
    </div>

    {/* Add Warehouse BTN */}
    <div className='bg-light rounded-lg '>
        <Link href={'/admin/warehouses/add_warehouse'} className='rounded-lg border border-dark/20 flex w-full items-center justify-center gap-3 text-sm py-3 font-bold'>
            <FaPlus/>
            Add Warehouse
        </Link>
    </div>

    {/* SEARCH COMPONENT */}
    <SearchComponent />

    {/* Table */}
    <div className='bg-light p-body rounded-lg'>
        <p className='text-xs mt-2 opacity-70'>
            A list of all Warehouses in the system.
        </p>
        <div className='max-w-full w-full bg-red-100 mt-4'>
            {loading ? (
                <div className='flex justify-center items-center py-8'>
                    <ClipLoader color="#3B82F6" size={30} />
                    <span className='ml-2 text-sm'>Loading warehouses...</span>
                </div>
            ) : error ? (
                <div className='text-center py-8'>
                    <p className='text-red-500 text-sm'>{error}</p>
                </div>
            ) : (
                <Table 
                    importedData={warehouses}
                    columnDef={columnDef}
                    globalFilter=''
                />
            )}
        </div>
    </div>
  </div>
}

export default Page