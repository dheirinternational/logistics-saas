"use client"

import { CopyableValue } from "@/components/ui/CopyableValue"
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
        <h1 className="portal-home__greeting-title">
          <span className="portal-home__greeting-prefix">{greeting}</span>{" "}
          {name}
        </h1>
        <p className="portal-home__greeting-sub">
          Here is what needs your attention today.
        </p>
      </div>
      {memberCode ? (
        <CopyableValue
          layout="stacked"
          label="Member code"
          value={memberCode}
          successMessage="Member code copied"
          className="portal-home__member-code"
          valueClassName="portal-home__member-code-value"
        />
      ) : null}
    </header>
  )
}
