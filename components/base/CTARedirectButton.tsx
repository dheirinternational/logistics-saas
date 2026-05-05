import Link from "next/link"
import { IconType } from "react-icons"

export type CTARedirectButton = {
    title: string
    path: string
    icon: IconType
    totalCount?: number
}

const CTARedirectButton = ({title, path, icon: Icon}: CTARedirectButton) => {
  return (
    <Link 
    href={path} 
    className="flex flex-col items-center w-21 gap-2 max-w-25"
    >
        <div className="bg-accent-red p-3 w-fit rounded-lg">
            <Icon className="text-2xl text-white"/>
        </div>
        <span className="text-[10px] text-center">
            {title}
        </span>
    </Link>
  )
}

export default CTARedirectButton