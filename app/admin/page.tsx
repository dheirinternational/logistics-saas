import { NextPage } from 'next'

const Page: NextPage = () => {
  return (
    <div className='max-h-full h-full p-body space-y-4'>

        {/* System Snapshot */}
        <div className='bg-accent-blue p-4 rounded-lg text-secondary-text relative'>
            <span className=' text-xs'>
                System Snapshot
            </span>
            <h3 className='font-bold text-4xl mt-4'>
                1250
            </h3>
            <p className='text-sm opacity-80 mt-1'>
                Total active shipment record
            </p>
            <div className='flex items-center gap-x-2 text-xs bg-black/70 w-fit px-3 rounded-full py-1 absolute right-4 bottom-4'>
                <div className='w-2 h-2 bg-white rounded-full'/>
                <span>live</span>
            </div>
        </div>

        {/* Stats */}
        <div>
            <div className='flex justify-between items-center'>
                <h2 className='font-bold text-sm'>
                    STATS
                </h2>
                <button className='text-xs font-bold'>
                    See all
                </button>
            </div>

            {/* STATS Components Ctn */}
            <div className='flex'>

            </div>
        </div>

    </div>
  )
}

export default Page