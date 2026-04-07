import CTARedirectButton from '@/components/base/CTARedirectButton'
import ProfileMenu from '@/components/base/ProfileMenu'
import LogoutButton from '@/components/base/LogoutButton'
import { profileCtaButtonsProps, profileMenuCtaButtonsProps } from '@/components_map_definitions/ctaRedirectButtons'
import { pool } from '@/lib/db/db'
import { getSession } from '@/lib/db/session'
import { NextPage } from 'next'
import { FaUser } from 'react-icons/fa'
import { HiSpeakerWave } from 'react-icons/hi2'
import { Address } from '@/types/entityTypeDef'


const Page: NextPage = async() => {

    const session = await getSession()
    const userId = session.user_id
    console.log(userId)

    const data = await pool.query(`
        SELECT u.first_name, u.last_name, c.code 
        FROM users u
        JOIN customers c ON u.id = c.user_id
        WHERE u.id = $1
    `, [userId])

    const userData = data.rows[0]
    console.log(userData)

    const addressData = await pool.query(`
        SELECT country, state, city, street, postal_code
        FROM addresses
        WHERE user_id = $1
        LIMIT 1
    `, [userId])
    
    const address = addressData.rows[0] as Address

  return <div className='w-full h-full space-y-3'>
    {/* Profile */}

    <div className='bg-accent-red h-30 flex items-center '>
        <div className='p-body flex gap-4'>
            <figure className='bg-[#adadad] h-18 w-18 min-w-18 rounded-full border-2 border-white/70 center-items overflow-hidden'>
                <FaUser className='text-6xl relative -bottom-2 text-white'/>
            </figure>
            <div className='flex items-start flex-col justify-center gap-2'>
                <span className='text-white font-semibold'>
                    {userData.first_name}{userData.last_name}
                </span>
                <div className='w-fit py-xs px-4 bg-white rounded-full'>
                    <span className='text-xs'>
                        Member Code: {userData.code}
                    </span>
                </div>
                <div>
                    <p className='text-white/70 text-xs'>
                        {address ? `${address.street}, ${address.city} ${address.state} ${address.postal_code}` : "No Address Added"}
                    </p>
                </div>
            </div>
        </div>
    </div>

    {/* Announcement */}

    <div className='p-body bg-white shadow shadow-dark/10 flex'>
        <div className=' h-full w-7 '>
            <HiSpeakerWave className='text-2xl' />
        </div>
        <div className='w-[calc(100%-46px)] bg-amber-500 h-full'>
            <p className='text-sm'>
                Announcement: Work Hours Notice
            </p>
        </div>
    </div>

    {/* Shipment Control */}
    <div className='p-body bg-white shadow shadow-dark/10 flex flex-wrap gap-5 justify-center'>
        {profileCtaButtonsProps.map((btn, i) => 
            <CTARedirectButton key={i} {...btn}/>
        )}
    </div>
    
    {/* Profile Management */}
    <div className='bg-white shadow shadow-dark/10 pb-30'>
        {profileMenuCtaButtonsProps.map((link, i) => 
        <ProfileMenu key={i} {...link}/>
        )}
        <LogoutButton />
    </div>
        
  </div>
}

export default Page