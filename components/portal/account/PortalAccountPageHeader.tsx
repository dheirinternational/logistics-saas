import { PortalPageBack } from "@/components/portal/PortalPageBack"

type PortalAccountPageHeaderProps = {
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
}

export function PortalAccountPageHeader({
  title,
  description,
  backHref = "/customer/profile",
  backLabel = "Account",
}: PortalAccountPageHeaderProps) {
  return (
    <header className="portal-account__header">
      <PortalPageBack href={backHref} label={backLabel} />
      {title ? <h1 className="portal-account__title">{title}</h1> : null}
      {description ? (
        <p className="portal-account__subtitle">{description}</p>
      ) : null}
    </header>
  )
}
