import AddPackage from '@/components/admin/packages/AddPackage'
import { NextPage } from 'next'

const Page: NextPage = () => {
  return <div className='space-y-body p-body'>
    <div className='p-4 bg-accent-red rounded-l text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Add Package
        </h1>
    </div>

    <hr className='border border-dark/20 my-8'/>


    {/* FORM */}
    <AddPackage />

    {/* Table */}
    <div className='bg-light p-body rounded-lg'>
        <h2 className='text-sm font-bold'>
            Shipment Records
        </h2>
        <p className='text-xs mt-2 opacity-70'>
            A live overview of all shipments in the system.
        </p>
        <div>
            Table
        </div>
    </div>
  </div>
}

export default Page