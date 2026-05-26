import type { PortalAccountLink } from "@/lib/portal/accountActions"
import { IconChevronRight } from "@tabler/icons-react"
import Link from "next/link"

type PortalAccountLinkRowProps = {
  link: PortalAccountLink
}

export function PortalAccountLinkRow({ link }: PortalAccountLinkRowProps) {
  const Icon = link.icon

  return (
    <Link href={link.href} className="portal-account__link">
      <span className="portal-account__link-icon" aria-hidden>
        <Icon size={22} stroke={1.5} />
      </span>
      <span className="portal-account__link-body">
        <span className="portal-account__link-label">{link.label}</span>
        <span className="portal-account__link-desc">{link.description}</span>
      </span>
      <IconChevronRight
        size={18}
        stroke={1.5}
        className="portal-account__link-chevron"
        aria-hidden
      />
    </Link>
  )
}
