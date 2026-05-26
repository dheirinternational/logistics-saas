import { PortalAccountPage } from "@/components/portal/account/PortalAccountPage"
import { getPortalAccountData } from "@/lib/portal/account"
import { getSession } from "@/lib/db/session"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const data = await getPortalAccountData(session.user_id)

  return <PortalAccountPage data={data} />
}
