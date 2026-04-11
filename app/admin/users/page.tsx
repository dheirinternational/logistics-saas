"use client"

import { Table } from '@/components/admin/table/Table'
import SearchComponent from '@/components/admin/users/SearchComponent'
import { User } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'


interface CustomerDetails extends User{
    code: string
}

type FilterParams = {
    search: string, 
}


const columnHelper = createColumnHelper<CustomerDetails>()


const Page: NextPage = () => {

    const [users, setUsers] = useState<CustomerDetails[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [filterValues, setFilterValues] = useState({
        search: ""
    })

    const fetchUsers = async () => {
        setIsDataLoading(true)
        try{    
            const res = await fetch("/api/users")
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setUsers(result.data)
        }
        catch(err){
            toast.error("ERR:: Getting users data from database")
            console.log("ERR:: Getting users data from database", err)
        }
        finally{
            setIsDataLoading(false)
        }
    }

    // Initialize FetchUSers call
    useEffect(() => {
        fetchUsers()
    }, [])

    // Table Column Def
    const columnDef = [
        columnHelper.accessor("last_name", {
            header: "Last Name"
        }),
        columnHelper.accessor("first_name", {
            header: "First Name"
        }),
        columnHelper.accessor("code", {
            header: "First Name"
        }),
        columnHelper.accessor("email", {
            header: "Email"
        }),
        columnHelper.accessor("phone", {
            header: "Phone"
        }),
    ]

    // Filter Data
    const filteredData = users.filter( x => x.email.toLowerCase().includes(filterValues.search.toLowerCase()) || x.code.toLowerCase().includes(filterValues.search.toLowerCase()) )

  return <div className='space-y-body'>
    <div className='p-4 bg-accent-blue rounded-lg text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Manage Users
        </h1>
        <div>
            <p className='text-[10px] opacity-70'>
                Monitor, filter, and manage all Users from one control deck.
            </p>
        </div>
    </div>


    {/* USERS CARDS */}
    <div>
        <h2 className='text-sm'>
            USERS
        </h2>
        <div className='flex my-body space-x-2 overflow-x-auto'>
            {/* <StatusStatCard />
            <StatusStatCard />
            <StatusStatCard /> */}
        </div>
    </div>

    {/* SEARCH COMPONENT */}

    <SearchComponent filter={filterValues} setFilter={setFilterValues}/>

    {/* Table */}
    <div className='bg-light p-body rounded-lg'>
        <h2 className='text-sm font-bold'>
            User Records
        </h2>
        <p className='text-[10px] mt-2 opacity-70'>
            A list of all Users in the system.
        </p>
        <div className='mt-3'>
            {
                isDataLoading ? 
                <BeatLoader color='orange' size={10}/> :
                <Table 
                importedData={filteredData}
                columnDef={columnDef}
                globalFilter=''
                />
            }
        </div>
    </div>
  </div>
}

export default Page