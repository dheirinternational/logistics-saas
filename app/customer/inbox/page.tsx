import { PortalInboxPage } from "@/components/portal/inbox/PortalInboxPage"
import { getPortalInboxMessages } from "@/lib/portal/inbox"
import { getSession } from "@/lib/db/session"
import { redirect } from "next/navigation"

export default async function InboxPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const messages = await getPortalInboxMessages(session.user_id)
  return <PortalInboxPage messages={messages} />
}
