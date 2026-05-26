"use client"

import { PortalHomeActionGrid } from "@/components/portal/home/PortalHomeActionGrid"
import { PortalHomeActivityTable } from "@/components/portal/home/PortalHomeActivityTable"
import { PortalHomeGreeting } from "@/components/portal/home/PortalHomeGreeting"
import { PortalHomeOngoingSection } from "@/components/portal/home/PortalHomeOngoingSection"
import { PortalHomeStatsCards } from "@/components/portal/home/PortalHomeStatsCards"
import { PortalHomeToolbar } from "@/components/portal/home/PortalHomeToolbar"
import { PortalHomeTrackingView } from "@/components/portal/home/PortalHomeTrackingView"
import { PortalWhatsAppFab } from "@/components/portal/home/PortalWhatsAppFab"
import type { PortalDashboardData } from "@/lib/portal/dashboard"
import {
  PORTAL_HOME_PRIORITY_ACTIONS,
  PORTAL_HOME_QUICK_ACTIONS,
} from "@/lib/portal/homeActions"
import { useCallback, useEffect, useState } from "react"

export type PortalHomeTab = "overview" | "tracking"

type PortalHomeClientProps = {
  data: PortalDashboardData
}

function tabFromHash(): PortalHomeTab {
  if (typeof window === "undefined") return "overview"
  return window.location.hash === "#tracking" ? "tracking" : "overview"
}

export function PortalHomeClient({ data }: PortalHomeClientProps) {
  const [tab, setTab] = useState<PortalHomeTab>("overview")

  useEffect(() => {
    setTab(tabFromHash())

    const onHashChange = () => setTab(tabFromHash())
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  const onTabChange = useCallback((next: PortalHomeTab) => {
    setTab(next)
    const path = next === "tracking" ? "/base#tracking" : "/base"
    window.history.replaceState(null, "", path)
  }, [])

  return (
    <div className="portal-home">
      <PortalHomeGreeting
        firstName={data.firstName}
        memberCode={data.memberCode}
      />

      <PortalHomeToolbar activeTab={tab} onTabChange={onTabChange} />

      {tab === "overview" ? (
        <>
          <PortalHomeStatsCards counts={data.counts} />

          <div className="portal-home__split portal-home__split--main">
            <PortalHomeOngoingSection shipments={data.activeShipments} />
            <PortalHomeActivityTable rows={data.recentActivity} />
          </div>

          <div className="portal-home__split portal-home__split--actions">
            <PortalHomeActionGrid
              title="Start here"
              subtitle="Mostly used"
              actions={PORTAL_HOME_PRIORITY_ACTIONS}
              counts={data.counts}
              columns={2}
            />
            <PortalHomeActionGrid
              title="Quick actions"
              subtitle="Packages, shipping, payments, and shop"
              actions={PORTAL_HOME_QUICK_ACTIONS}
              counts={data.counts}
              columns={2}
            />
          </div>
        </>
      ) : (
        <PortalHomeTrackingView />
      )}

      <PortalWhatsAppFab />
    </div>
  )
}
