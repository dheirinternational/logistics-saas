"use client"

import { logoutAction } from '@/lib/db/actions'
import { FaChevronRight } from 'react-icons/fa'
import { LuLogOut } from 'react-icons/lu'

const LogoutButton = () => {
  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <button 
      className='py-4 px-4 flex w-full items-center justify-between'
      onClick={handleLogout}
    >
      <div className='flex gap-4'>
        <LuLogOut className='text-xl'/>
        <span className='text-sm text-primary-text/80'>
          Log Out
        </span>
      </div>
      <FaChevronRight className='text-dark/40' />
    </button>
  )
}

export default LogoutButton
