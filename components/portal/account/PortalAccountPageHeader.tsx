type PortalAccountPageHeaderProps = {
  title: string
  description?: string
}

export function PortalAccountPageHeader({
  title,
  description,
}: PortalAccountPageHeaderProps) {
  return (
    <header className="portal-account__header">
      <h1 className="portal-account__title">{title}</h1>
      {description ? (
        <p className="portal-account__subtitle">{description}</p>
      ) : null}
    </header>
  )
}
