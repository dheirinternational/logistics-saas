import Link from "next/link"
import { IconType } from "react-icons"

export type CTARedirectButton = {
    title: string
    path: string
    icon: IconType
}

const CTARedirectButton = ({title, path, icon: Icon}: CTARedirectButton) => {
  return (
    <Link 
    href={"/"} 
    className="flex flex-col items-center w-fit gap-2"
    >
        <div className="bg-accent-red p-2 w-fit rounded-lg">
        <Icon className="text-2xl"/>
        </div>
        <span className="text-xs">
        Request Mail
        </span>
    </Link>
  )
}

export default CTARedirectButton