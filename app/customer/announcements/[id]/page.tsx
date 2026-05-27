import { PortalAnnouncementDetailPage } from "@/components/portal/announcements/PortalAnnouncementDetailPage"
import { getPortalAnnouncementById } from "@/lib/portal/announcements"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params
  const announcement = await getPortalAnnouncementById(id)

  if (!announcement) {
    notFound()
  }

  return <PortalAnnouncementDetailPage announcement={announcement} />
}
