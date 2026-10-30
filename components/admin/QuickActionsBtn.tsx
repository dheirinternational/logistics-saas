import Link from "next/link"
import type { Icon } from "@tabler/icons-react"
import type { ComponentType } from "react"

type props = {
  link: string
  icon: Icon | ComponentType<{ className?: string; size?: number | string }>
  title: string
}

const QuickActionsBtn = ({ link, icon: Icon, title }: props) => {
  return (
    <Link 
      href={link} 
      className="bg-primary w-16 h-16 rounded-lg center-items flex-col gap-y-1"
    >
      <Icon size={20} />
      <span className="text-xs">
        {title}
      </span>
    </Link>
  )
}

export default QuickActionsBtn
