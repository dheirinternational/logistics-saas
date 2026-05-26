import { PortalHomeClient } from "@/components/portal/home/PortalHomeClient"
import { getPortalDashboardData } from "@/lib/portal/dashboard"
import { getSession } from "@/lib/db/session"
import { redirect } from "next/navigation"

export default async function BaseHomePage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const data = await getPortalDashboardData(session.user_id)

  return <PortalHomeClient data={data} />
}
