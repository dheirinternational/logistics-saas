import CreateUser from '@/components/users/CreateUser'
import { NextPage } from 'next'

const Page: NextPage = () => {
  return <div className='space-y-body'>
    <div className='p-4 bg-accent-blue rounded-lg text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Add User
        </h1>
    </div>

    <CreateUser />
  </div>
}

export default Page