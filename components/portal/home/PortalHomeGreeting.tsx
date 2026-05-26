import { getTimeGreeting } from "@/lib/portal/greeting"

type PortalHomeGreetingProps = {
  firstName: string
  memberCode: string
}

export function PortalHomeGreeting({
  firstName,
  memberCode,
}: PortalHomeGreetingProps) {
  const greeting = getTimeGreeting()
  const name = firstName.trim() || "there"

  return (
    <header className="portal-home__greeting">
      <div>
        <p className="portal-home__greeting-label">{greeting}</p>
        <h1 className="portal-home__greeting-title">{name}</h1>
        <p className="portal-home__greeting-sub">
          Here is what needs your attention today.
        </p>
      </div>
      {memberCode ? (
        <div className="portal-home__member-code">
          <span className="portal-home__member-code-label">Member code</span>
          <span className="portal-home__member-code-value">{memberCode}</span>
        </div>
      ) : null}
    </header>
  )
}
