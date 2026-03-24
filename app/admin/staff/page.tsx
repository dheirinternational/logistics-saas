import SearchComponent from '@/components/admin/staff/SearchComponent'
import StatusStatCard from '@/components/admin/StatusStatCard'
import { NextPage } from 'next'

const Page: NextPage = () => {
  return <div className='space-y-body'>
    <div className='p-4 bg-accent-red rounded-lg text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Manage Staff
        </h1>
        <div>
            <p className='text-[10px] opacity-70'>
                Manage Staff assignment and details.
            </p>
        </div>
    </div>

    {/* STATUS CARDS */}
    <div>
        <h2 className='text-sm'>
            STATS
        </h2>
        <div className='flex my-body space-x-2 overflow-x-auto'>
            <StatusStatCard />
            <StatusStatCard />
            <StatusStatCard />
        </div>
    </div>

    {/* Search Form */}
    <SearchComponent />

    {/* Table */}
    <div className='bg-light p-body rounded-lg'>
        <h2 className='text-sm font-bold'>
            Staffs
        </h2>
        <p className='text-xs mt-2 opacity-70'>
            A list of all Staffs in the system.
        </p>
        <div>
            Table
        </div>
    </div>
  </div>
}

export default Page