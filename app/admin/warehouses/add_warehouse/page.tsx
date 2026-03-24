import AddWarehouse from '@/components/admin/warehouse/AddWarehouse'
import { NextPage } from 'next'

const Page: NextPage = ({}) => {
  return <div className='space-y-body'>
    <div className='p-4 bg-accent-red rounded-lg text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Add Warehouse
        </h1>
    </div>
    
    <hr className='border border-dark/20 my-8'/>

    <AddWarehouse />
  </div>
}

export default Page