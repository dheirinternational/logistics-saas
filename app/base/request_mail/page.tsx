import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaChevronLeft, FaUser } from 'react-icons/fa'

const Page: NextPage = () => {

    const router = useRouter()

  return <div className='h-full w-full space-y-body'>
    <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
        <button 
        className='flex gap-2 flex-1 justify-start'
        onClick={() => {router.back()}}
        >
            <FaChevronLeft />
            <span className='text-xs font-semiboldd'>
                Go Back
            </span>
        </button>
        <h1 className='font-semibold'>
            Add a package
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>
  </div>
}

export default Page