import { PortalAccountLinkRow } from "@/components/portal/account/PortalAccountLinkRow"
import { CopyableValue } from "@/components/ui/CopyableValue"
import {
  formatAccountAddress,
  type PortalAccountData,
} from "@/lib/portal/account"
import { PORTAL_ACCOUNT_LINKS } from "@/lib/portal/accountActions"
import { IconUser } from "@tabler/icons-react"
import Image from "next/image"

type PortalAccountPageProps = {
  data: PortalAccountData
}

export function PortalAccountPage({ data }: PortalAccountPageProps) {
  const fullName =
    [data.firstName, data.lastName].filter(Boolean).join(" ") || "Account"
  const addressLine = formatAccountAddress(data.address)

  return (
    <div className="portal-account">
      <header className="portal-account__header">
        <h1 className="portal-account__title">Account</h1>
        <p className="portal-account__subtitle">
          Profile and delivery details for your DHEIR account.
        </p>
      </header>

      <section className="portal-account__profile" aria-label="Your profile">
        <div className="portal-account__avatar">
          {data.profileImg ? (
            <Image
              src={data.profileImg}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <IconUser size={36} stroke={1.25} aria-hidden />
          )}
        </div>
        <div className="portal-account__profile-body">
          <p className="portal-account__name">{fullName}</p>
          {data.email ? (
            <CopyableValue
              layout="inline"
              value={data.email}
              successMessage="Email copied"
              className="portal-account__copy-row portal-account__copy-row--email"
              valueClassName="portal-account__email"
            />
          ) : null}
          {data.memberCode ? (
            <CopyableValue
              layout="pill"
              label="Member code"
              value={data.memberCode}
              successMessage="Member code copied"
              className="portal-account__member-code"
              valueClassName="portal-account__member-code-value"
            />
          ) : null}
          {data.address ? (
            <CopyableValue
              layout="inline"
              value={addressLine}
              successMessage="Address copied"
              className="portal-account__copy-row portal-account__copy-row--address"
              valueClassName="portal-account__address"
            />
          ) : (
            <p className="portal-account__address">{addressLine}</p>
          )}
        </div>
      </section>

      <section className="portal-account__section" aria-labelledby="account-settings">
        <h2 id="account-settings" className="portal-account__section-title">
          Account settings
        </h2>
        <ul className="portal-account__links">
          {PORTAL_ACCOUNT_LINKS.map((link) => (
            <li key={link.id}>
              <PortalAccountLinkRow link={link} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
