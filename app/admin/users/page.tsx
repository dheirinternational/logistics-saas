import StatusStatCard from '@/components/admin/ShipmentStatusStatCard'
import SearchComponent from '@/components/admin/users/SearchComponent'
import { NextPage } from 'next'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'

const Page: NextPage = () => {
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

    {/* ADD USER BUTTON */}
    <div className='bg-light rounded-lg '>
        <Link href={'/admin/users/create_user'} className='rounded-lg border border-dark/20 flex w-full items-center justify-center gap-3 text-sm py-3 font-bold'>
            <FaPlus/>
            Create User
        </Link>
    </div>

    {/* USERS CARDS */}
    <div>
        <h2 className='text-sm'>
            USERS
        </h2>
        <div className='flex my-body space-x-2 overflow-x-auto'>
            <StatusStatCard />
            <StatusStatCard />
            <StatusStatCard />
        </div>
    </div>

    {/* SEARCH COMPONENT */}

    <SearchComponent />

    {/* Table */}
    <div className='bg-light p-body rounded-lg'>
        <h2 className='text-sm font-bold'>
            User Records
        </h2>
        <p className='text-xs mt-2 opacity-70'>
            A list of all Users in the system.
        </p>
        <div>
            Table
        </div>
    </div>
  </div>
}

export default Page