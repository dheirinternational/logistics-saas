"use client"

import type { MarketingHeaderUser } from "@/lib/marketing/headerUser"
import Image from "next/image"
import Link from "next/link"

type MarketingHeaderUserMenuProps = {
  user: MarketingHeaderUser
  onHero: boolean
  onNavigate?: () => void
  className?: string
  showLabel?: boolean
}

function getInitials(user: MarketingHeaderUser): string {
  const fromName = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
    .trim()
    .toUpperCase()
  if (fromName) return fromName
  return (user.email[0] ?? "U").toUpperCase()
}

export function MarketingHeaderUserMenu({
  user,
  onHero,
  onNavigate,
  className = "",
  showLabel = true,
}: MarketingHeaderUserMenuProps) {
  const initials = getInitials(user)
  // Marketing header should always link to the customer dashboard entry.
  const dashboardHref = "/customer/profile"

  return (
    <Link
      href={dashboardHref}
      onClick={onNavigate}
      className={`marketing-header-user inline-flex max-w-[min(100%,220px)] items-center gap-2.5 rounded-full py-1 pl-1 pr-3 no-underline sm:pr-4 ${
        onHero ? "marketing-header-glass" : "border border-[var(--color-dheir-border)] bg-dheir-surface shadow-[var(--shadow-dheir-soft)]"
      } ${className}`}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dheir-blue text-xs font-bold text-white">
        {user.profileImg ? (
          <Image
            src={user.profileImg}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
            unoptimized
          />
        ) : (
          initials
        )}
      </span>
      {showLabel ? (
        <span
          className={`truncate font-display text-sm font-semibold tracking-tight ${
            onHero ? "text-white" : "text-dheir-ink"
          }`}
        >
          {user.displayName}
        </span>
      ) : null}
    </Link>
  )
}
