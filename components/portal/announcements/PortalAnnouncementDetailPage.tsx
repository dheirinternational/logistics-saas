import { PortalPageBack } from "@/components/portal/PortalPageBack"
import type { PortalAnnouncement } from "@/lib/portal/announcements"
import { IconSpeakerphone } from "@tabler/icons-react"
import Link from "next/link"

type PortalAnnouncementDetailPageProps = {
  announcement: PortalAnnouncement
}

export function PortalAnnouncementDetailPage({
  announcement,
}: PortalAnnouncementDetailPageProps) {
  const published = new Date(announcement.createdAt).toLocaleDateString(
    undefined,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  return (
    <div className="portal-account portal-announcements">
      <header className="portal-account__header">
        <PortalPageBack href="/customer/announcements" label="Announcements" />
        <h1 className="portal-account__title">{announcement.title}</h1>
        <p className="portal-account__subtitle">
          <time dateTime={announcement.createdAt}>{published}</time>
        </p>
      </header>

      <article className="portal-account__card portal-announcements__article">
        <div className="portal-announcements__article-label">
          <IconSpeakerphone size={18} stroke={1.5} aria-hidden />
          <span>Announcement</span>
        </div>
        <div className="portal-announcements__article-body">
          {announcement.message.trim() ? (
            announcement.message.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))
          ) : (
            <p className="portal-announcements__empty-hint">No message content.</p>
          )}
        </div>
      </article>

      <p className="portal-announcements__footer-link">
        <Link href="/customer/announcements" className="portal-cart__link">
          View all announcements
        </Link>
      </p>
    </div>
  )
}
