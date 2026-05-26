import { PortalShellLayout } from "@/components/portal/PortalShellLayout"
import type { MarketingHeaderUser } from "@/lib/marketing/headerUser"
import { ReactNode } from "react"

type PortalShellProps = {
  user: MarketingHeaderUser
  children: ReactNode
}

export function PortalShell({ user, children }: PortalShellProps) {
  return (
    <PortalShellLayout user={user}>{children}</PortalShellLayout>
  )
}
