import Link from "next/link"
import { FaChevronRight } from "react-icons/fa"
import { CTARedirectButton } from "./CTARedirectButton"


const ProfileMenu = ({path, title, icon: Icon} : CTARedirectButton) => {
  return (
    <Link href={path} className='py-4 px-4 flex w-full items-center justify-between'>
        <div className='flex gap-4'>
            <Icon className='text-base'/>
            <span className='text-xs text-primary-text/80'>
                {title}
            </span>
        </div>
        <FaChevronRight className='text-dark/40' />
    </Link>
  )
}

export default ProfileMenu