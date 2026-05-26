import { PortalHomeActionGrid } from "@/components/portal/home/PortalHomeActionGrid"
import { PortalHomeAnnouncements } from "@/components/portal/home/PortalHomeAnnouncements"
import { PortalHomeGreeting } from "@/components/portal/home/PortalHomeGreeting"
import { PortalHomeReviews } from "@/components/portal/home/PortalHomeReviews"
import { PortalHomeStatusStrip } from "@/components/portal/home/PortalHomeStatusStrip"
import { PortalHomeWarehouseCard } from "@/components/portal/home/PortalHomeWarehouseCard"
import { PortalWhatsAppFab } from "@/components/portal/home/PortalWhatsAppFab"
import type { PortalDashboardData } from "@/lib/portal/dashboard"
import {
  PORTAL_HOME_PRIORITY_ACTIONS,
  PORTAL_HOME_QUICK_ACTIONS,
} from "@/lib/portal/homeActions"

type PortalHomePageProps = {
  data: PortalDashboardData
}

export function PortalHomePage({ data }: PortalHomePageProps) {
  return (
    <div className="portal-home">
      <PortalHomeGreeting
        firstName={data.firstName}
        memberCode={data.memberCode}
      />

      <PortalHomeStatusStrip counts={data.counts} />

      {data.warehouse ? (
        <PortalHomeWarehouseCard
          warehouseName={data.warehouse.name}
          copyText={data.warehouse.copyText}
        />
      ) : null}

      <PortalHomeActionGrid
        title="Start here"
        subtitle="The most common next steps"
        actions={PORTAL_HOME_PRIORITY_ACTIONS}
        counts={data.counts}
        columns={3}
      />

      <PortalHomeActionGrid
        title="Quick actions"
        subtitle="Packages, shipping, payments, and shop"
        actions={PORTAL_HOME_QUICK_ACTIONS}
        counts={data.counts}
        columns={3}
      />

      <PortalHomeAnnouncements announcements={data.announcements} />

      <PortalHomeReviews />

      <PortalWhatsAppFab />
    </div>
  )
}
