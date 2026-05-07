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
import Image from 'next/image'
import { Announcements } from '@/components/base/Announcements'


const Page: NextPage = async() => {
    let address;
    let userData;
    let sum;
    try{
        const session = await getSession()
        const userId = session.user_id
        console.log(userId)

        const data = await pool.query(`
            SELECT u.first_name, u.last_name, c.code, u.profile_img
            FROM users u
            JOIN customers c ON u.id = c.user_id
            WHERE u.id = $1
        `, [userId])

        userData = data.rows[0]
        console.log(userData)

        const addressData = await pool.query(`
            SELECT country, state, city, street, postal_code
            FROM addresses
            WHERE user_id = $1
            LIMIT 1
        `, [userId])
        
        address = addressData.rows[0] as Address

        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM incoming_packages 
                WHERE status != 'stored' AND user_id = $1) AS waiting_to_be_stored,

                (SELECT COUNT(*) 
                FROM shipments 
                WHERE status != 'delivered' AND user_id = $1) AS shipment,

                (SELECT COUNT(*) 
                FROM payments 
                WHERE status = 'pending' AND user_id = $1) AS pending_payments,

                (SELECT COUNT(*) 
                FROM shipment_requests 
                WHERE status != 'accepted' AND user_id = $1) AS request_mail,

                (SELECT COUNT(*) 
                FROM packages WHERE status != 'assigned_to_shipment' AND user_id = $1) AS total_packages;
                
        `, [userId])
        
        console.log(result.rows)
        sum = result.rows[0]
        console.log(sum.waiting_to_be_stored)


    }
    catch(err){
        console.error("ERROR", err)
    }
    

  return <div className='w-full h-full space-y-3'>
    {/* Profile */}

    <div className='bg-accent-red h-30 flex items-center '>
        <div className='p-body flex gap-4 md:max-w-125 md:mx-auto'>
            <figure className='bg-[#adadad] h-18 w-18 min-w-18 rounded-full border-2 border-white/70 center-items overflow-hidden relative'>
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

    <Announcements />

    {/* Shipment Control */}
    <div className='p-body bg-white shadow shadow-dark/10 flex flex-wrap gap-5 justify-center md:max-w-125 md:mx-auto'>
        {/* {profileCtaButtonsProps.map((btn, i) => 
            <CTARedirectButton key={i} {...btn}/>
        )} */}
        <div className='w-fit h-fit relative'>
            <CTARedirectButton {...profileCtaButtonsProps[0]}/>
        </div>
        <div className='h-fit relative'>
            <div className='w-5 h-5 absolute left-1/2 -translate-x-1/2 -top-2.5 rounded-full '>
                <div className='w-full h-full rounded-full bg-black relative left-6 center-items text-white text-[10px]'>
                    {sum.waiting_to_be_stored}
                </div>
            </div>
            <CTARedirectButton {...profileCtaButtonsProps[1]}/>
        </div>
        <div className='w-fit h-fit relative'>
            <div className='w-5 h-5 absolute left-1/2 -translate-x-1/2 -top-2.5 rounded-full '>
                <div className='w-full h-full rounded-full bg-black relative left-6 center-items text-white text-[10px]'>
                    {sum.total_packages}
                </div>
            </div>
            <CTARedirectButton {...profileCtaButtonsProps[2]}/>
        </div>
        <div className='w-fit h-fit relative'>
            <CTARedirectButton {...profileCtaButtonsProps[3]}/>
        </div>
        <div className='w-fit h-fit relative'>
            <div className='w-5 h-5 absolute left-1/2 -translate-x-1/2 -top-2.5 rounded-full '>
                <div className='w-full h-full rounded-full bg-black relative left-6 center-items text-white text-[10px]'>
                    {sum.request_mail}
                </div>
            </div>
            <CTARedirectButton {...profileCtaButtonsProps[4]}/>
        </div>
        <div className='w-fit h-fit relative'>
            <div className='w-5 h-5 absolute left-1/2 -translate-x-1/2 -top-2.5 rounded-full '>
                <div className='w-full h-full rounded-full bg-black relative left-6 center-items text-white text-[10px]'>
                    {sum.shipment}
                </div>
            </div>
            <CTARedirectButton {...profileCtaButtonsProps[5]}/>
        </div>
        <div className='w-fit h-fit relative'>
            <CTARedirectButton {...profileCtaButtonsProps[6]}/>
        </div>
        <div className='w-fit h-fit relative'>
            <div className='w-5 h-5 absolute left-1/2 -translate-x-1/2 -top-2.5 rounded-full '>
                <div className='w-full h-full rounded-full bg-black relative left-6 center-items text-white text-[10px]'>
                    {sum.pending_payments}
                </div>
            </div>
            <CTARedirectButton {...profileCtaButtonsProps[7]}/>
        </div>
        <div className='w-fit h-fit relative'>
            <CTARedirectButton {...profileCtaButtonsProps[8]}/>
        </div>
    </div>
    
    {/* Profile Management */}
    <div className='bg-white shadow shadow-dark/10 pb-30 md:max-w-125 md:mx-auto'>
        {profileMenuCtaButtonsProps.map((link, i) => 
        <ProfileMenu key={i} {...link}/>
        )}
        <LogoutButton />
    </div>
        
  </div>
}

export default Page