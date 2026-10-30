import Link from "next/link"
import type { Icon } from "@tabler/icons-react"
import type { ComponentType } from "react"

export type CTARedirectButton = {
  title: string
  path: string
  icon: Icon | ComponentType<{ className?: string; size?: number | string }>
  totalCount?: number
}

const CTARedirectButton = ({ title, path, icon: Icon }: CTARedirectButton) => {
  return (
    <Link 
      href={path} 
      className="flex flex-col items-center w-21 gap-2 max-w-25"
    >
      <div className="bg-accent-red p-3 w-fit rounded-lg">
        <Icon className="text-2xl text-white" size={24} />
      </div>
      <span className="text-[10px] text-center">
        {title}
      </span>
    </Link>
  )
}

export default CTARedirectButton
