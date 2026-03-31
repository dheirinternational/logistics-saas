import SearchComponent from '@/components/admin/packages/SearchComponent'
import StatusStatCard from '@/components/admin/StatusStatCard'
import { NextPage } from 'next'


const Page: NextPage = ({}) => {
    
    //  Add Packages to system from table

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

    {/* <div className='bg-light rounded-lg mt-2'>
        <Link href={'/admin/packages/add_package'} className='rounded-lg border border-dark/20 flex w-full items-center justify-center gap-3 text-sm py-3 font-bold'>
            <LuPackagePlus className='text-lg'/>
            Add package
        </Link>
    </div> */}


    {/* STATUS CARDS */}
    <div className='mt-4'>
        <h2 className='text-sm'>
            STATS
        </h2>
        <div className='flex my-body space-x-2 overflow-x-auto'>
            <StatusStatCard />
            <StatusStatCard />
            <StatusStatCard />
            <StatusStatCard />
        </div>
    </div>

    {/* SEARCH COMPONENT  */}
    <SearchComponent />
  </div>
}

export default Page