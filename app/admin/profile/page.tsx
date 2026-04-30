import ProfileMenu from '@/components/base/ProfileMenu'
import LogoutButton from '@/components/base/LogoutButton'
import { adminProfileMenuCtaButtonsProps } from '@/components_map_definitions/ctaRedirectButtons'
import { pool } from '@/lib/db/db'
import { getSession } from '@/lib/db/session'
import { NextPage } from 'next'
import { FaUser } from 'react-icons/fa'
import { HiSpeakerWave } from 'react-icons/hi2'
import Image from 'next/image'


const Page: NextPage = async() => {

    const session = await getSession()
    const userId = session.user_id
    console.log(userId)

    const data = await pool.query(`
        SELECT u.first_name, u.last_name, u.profile_img, u.role, u.email 
        FROM users u
        WHERE u.id = $1
    `, [userId])

    console.log(data)

    const userData = data.rows[0]
    console.log(userData)


  return <div className='w-full h-full space-y-3'>
    {/* Profile */}
    
    <h2 className="text-2xl font-semibold">
            Profile
    </h2>
    
    <p className="text-xs text-dark/50 mt-2">
        Manage and edit your user Information.
    </p>

    <div className='bg-accent-red h-fit p-4 flex items-center rounded'>
        <div className='p-body flex gap-4'>
            <figure className='bg-[#adadad] h-26 w-26 rounded-full border-2 border-white/70 center-items overflow-hidden relative'>
                {
                    !userData.profile_img ?
                    <FaUser className='text-6xl relative -bottom-2 text-white'/> :
                    <Image 
                    src={userData.profile_img}
                    alt='Profile Img'
                    className='object-cover'
                    fill
                    />
                }
            </figure>
            <div className='flex items-start flex-col justify-center gap-1'>
                <span className='text-white font-semibold'>
                    {userData.first_name}{userData.last_name}
                </span>
                <span className='text-white text-xs'>
                    {userData.role}
                </span>
                <span className='text-xs text-white/60'>
                    {userData.email}
                </span>
            </div>
        </div>
    </div>
    
    {/* Profile Management */}
    <div className='bg-white shadow shadow-dark/10 rounded text-[10px]'>
        {adminProfileMenuCtaButtonsProps.map((link, i) => 
            <ProfileMenu key={i} {...link}/> 
        )}
        <LogoutButton />
    </div>
        
  </div>
}

export default Page