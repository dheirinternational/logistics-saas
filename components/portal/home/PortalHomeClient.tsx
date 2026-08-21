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
import { ProcurementPolicyModal } from "@/components/portal/procurement/ProcurementPolicyModal"
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
    const path = next === "tracking" ? "/customer#tracking" : "/customer"
    window.history.replaceState(null, "", path)
  }, [])

  return (
    <div className="portal-home">
      <PortalHomeGreeting
        firstName={data.firstName}
        memberCode={data.memberCode}
      />

      <div 
        className="my-6 p-5 rounded-xl border text-sm" 
        style={{ 
          backgroundColor: "#fef2f2", 
          borderColor: "#fca5a5", 
          color: "#991b1b",
          lineHeight: "1.6"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          Important Shipment Name Notice:
        </p>
        <p style={{ margin: "4px 0 0" }}>
          Please use the shipping method followed by your unique code as the shipment name (example: <strong style={{ fontWeight: 700 }}>Air/{data.memberCode || "Ronke-DHI0040"}</strong> or <strong style={{ fontWeight: 700 }}>Sea/{data.memberCode || "Ronke-DHI0040"}</strong>). Goods without shipping method and unique code will be rejected!!!
        </p>
      </div>

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
