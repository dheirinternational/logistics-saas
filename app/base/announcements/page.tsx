import { PortalAnnouncementsPage } from "@/components/portal/announcements/PortalAnnouncementsPage"
import { getPortalAnnouncements } from "@/lib/portal/announcements"

export default async function AnnouncementsIndexPage() {
  const announcements = await getPortalAnnouncements()
  return <PortalAnnouncementsPage announcements={announcements} />
}
