import { NextPage } from 'next'

const Page: NextPage = ({}) => {
  return <div className='space-y-body'>
    <div className='p-4 bg-accent-red rounded-lg text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Manage MarketPlace
        </h1>
        <div>
            <p className='text-[10px] opacity-70'>
                Monitor, filter, and manage all marketplace products from one control deck.
            </p>
        </div>
    </div>
  </div>
}

export default Page