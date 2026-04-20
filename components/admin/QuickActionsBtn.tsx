import Link from "next/link"
import { IconType } from "react-icons"

type props = {
  link: string
  icon: IconType
  title: string
}

const QuickActionsBtn = ({link, icon: Icon, title}: props) => {
  return (
    <Link 
    href={link} 
    className="bg-primary w-16 h-16 rounded-lg center-items flex-col gap-y-1"
    >
        <Icon />
        <span className="text-xs">
            {title}
        </span>
    </Link>
  )
}

export default QuickActionsBtn