import Link from "next/link"
import { IconChevronRight } from "@tabler/icons-react"
import { CTARedirectButton } from "./CTARedirectButton"

const ProfileMenu = ({ path, title, icon: Icon }: CTARedirectButton) => {
  return (
    <Link href={path} className="py-4 px-4 flex w-full items-center justify-between">
      <div className="flex gap-4 items-center">
        <Icon size={18} className="text-base" />
        <span className="text-xs text-primary-text/80">
          {title}
        </span>
      </div>
      <IconChevronRight size={18} className="text-dark/40" />
    </Link>
  )
}

export default ProfileMenu
