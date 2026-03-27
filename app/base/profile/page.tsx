import CTARedirectButton from '@/components/base/CTARedirectButton'
import ProfileMenu from '@/components/base/ProfileMenu'
import { profileCtaButtonsProps, profileMenuCtaButtonsProps } from '@/components_map_definitions/ctaRedirectButtons'
import { NextPage } from 'next'
import { FaUser } from 'react-icons/fa'
import { HiSpeakerWave } from 'react-icons/hi2'
const Page: NextPage = ({}) => {
  return <div className='w-full h-full space-y-3'>
    {/* Profile */}

    <div className='bg-accent-red h-30 flex items-center '>
        <div className='p-body flex gap-4'>
            <figure className='bg-[#adadad] h-18 w-18 rounded-full border-2 border-white/70 center-items overflow-hidden'>
                <FaUser className='text-6xl relative -bottom-2 text-white'/>
            </figure>
            <div className='flex items-start flex-col justify-center gap-2'>
                <span className='text-white font-semibold'>
                    Umar Sulaiman
                </span>
                <div className='w-fit py-xs px-4 bg-white rounded-full'>
                    <span className='text-xs'>
                        Member Code: KRC8729 
                    </span>
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
    <div className='bg-white shadow shadow-dark/10'>
        {profileMenuCtaButtonsProps.map((link, i) => 
        <ProfileMenu key={i} {...link}/>
        )}
    </div>

  </div>
}

export default Page