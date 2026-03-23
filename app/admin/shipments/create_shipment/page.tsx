import CreateShipments from '@/components/shipments/CreateShipments'
import { NextPage } from 'next'

const Page: NextPage = () => {
  return <div className='space-y-body p-body'>
    <div className='p-4 bg-accent-red rounded-l text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Create Shipments
        </h1>
    </div>

    {/* FORM */}
    <CreateShipments/>
  </div>
}

export default Page