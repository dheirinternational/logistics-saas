import { IconChevronLeft } from "@tabler/icons-react"
import Link from "next/link"

type PortalPageBackProps = {
  href: string
  label: string
}

export function PortalPageBack({ href, label }: PortalPageBackProps) {
  return (
    <Link href={href} className="portal-page-back">
      <IconChevronLeft size={18} stroke={1.5} aria-hidden />
      <span>{label}</span>
    </Link>
  )
}
