import type { ReactNode } from "react"

type PortalPackagesPageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function PortalPackagesPageHeader({
  title,
  description,
  action,
}: PortalPackagesPageHeaderProps) {
  return (
    <header className="portal-packages__header">
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
