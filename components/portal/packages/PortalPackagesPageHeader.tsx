import { PortalPageBack } from "@/components/portal/PortalPageBack"
import type { ReactNode } from "react"

type PortalPackagesPageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
  backHref?: string
  backLabel?: string
}

export function PortalPackagesPageHeader({
  title,
  description,
  action,
  backHref,
  backLabel,
}: PortalPackagesPageHeaderProps) {
  return (
    <header className="portal-packages__header">
      {backHref && backLabel ? (
        <PortalPageBack href={backHref} label={backLabel} />
      ) : null}
      <div className="portal-packages__header-row">
        <h1 className="portal-packages__title">{title}</h1>
        {action ? (
          <div className="portal-packages__header-action">{action}</div>
        ) : null}
      </div>
      {description ? (
        <p className="portal-packages__description">{description}</p>
      ) : null}
    </header>
  )
}
