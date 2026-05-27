"use client"

import type { PortalHomeTab } from "@/components/portal/home/PortalHomeClient"
import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"

type PortalHomeToolbarProps = {
  activeTab: PortalHomeTab
  onTabChange: (tab: PortalHomeTab) => void
}

export function PortalHomeToolbar({
  activeTab,
  onTabChange,
}: PortalHomeToolbarProps) {
  return (
    <div className="portal-home__toolbar">
      <div className="portal-home__tabs" role="tablist">
        <button
          type="button"
          className={`portal-home__tab${activeTab === "overview" ? " is-active" : ""}`}
          role="tab"
          aria-selected={activeTab === "overview"}
          onClick={() => onTabChange("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={`portal-home__tab${activeTab === "tracking" ? " is-active" : ""}`}
          role="tab"
          aria-selected={activeTab === "tracking"}
          onClick={() => onTabChange("tracking")}
        >
          Tracking
        </button>
      </div>
      <Link href="/customer/add_package" className="portal-home__cta">
        <IconPlus size={18} stroke={2} aria-hidden />
        Add package
      </Link>
    </div>
  )
}
