import type { ReactNode } from "react"

type PortalQuotePageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function PortalQuotePageHeader({
  title,
  description,
  action,
}: PortalQuotePageHeaderProps) {
  return (
    <header className="portal-quote__header">
      <div className="portal-quote__header-row">
        <h1 className="portal-quote__title">{title}</h1>
        {action ? (
          <div className="portal-quote__header-action">{action}</div>
        ) : null}
      </div>
      {description ? (
        <p className="portal-quote__description">{description}</p>
      ) : null}
    </header>
  )
}
