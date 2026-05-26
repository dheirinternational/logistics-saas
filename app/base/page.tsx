import { PortalHomePage } from "@/components/portal/home/PortalHomePage"
import { getPortalDashboardData } from "@/lib/portal/dashboard"
import { getSession } from "@/lib/db/session"
import { redirect } from "next/navigation"

export default async function BaseHomePage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const data = await getPortalDashboardData(session.user_id)

  return <PortalHomePage data={data} />
}
