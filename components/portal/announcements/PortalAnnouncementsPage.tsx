import { PortalPageBack } from "@/components/portal/PortalPageBack"
import type { PortalAnnouncement } from "@/lib/portal/announcements"
import { IconChevronRight, IconSpeakerphone } from "@tabler/icons-react"
import Link from "next/link"

type PortalAnnouncementsPageProps = {
  announcements: PortalAnnouncement[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function previewText(message: string, max = 120) {
  const trimmed = message.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max).trim()}…`
}

export function PortalAnnouncementsPage({
  announcements,
}: PortalAnnouncementsPageProps) {
  return (
    <div className="portal-account portal-announcements">
      <header className="portal-account__header">
        <PortalPageBack href="/base" label="Home" />
        <h1 className="portal-account__title">Announcements</h1>
        <p className="portal-account__subtitle">
          Updates from DHEIR about shipping, payments, and your account.
        </p>
      </header>

      {announcements.length === 0 ? (
        <div className="portal-packages__empty portal-announcements__empty">
          <IconSpeakerphone size={32} stroke={1.25} className="portal-announcements__empty-icon" aria-hidden />
          <p>No announcements right now.</p>
          <p className="portal-announcements__empty-hint">
            Check back later for service updates and news.
          </p>
        </div>
      ) : (
        <ul className="portal-announcements__list">
          {announcements.map((item) => (
            <li key={item.id}>
              <Link
                href={`/base/announcements/${item.id}`}
                className="portal-announcements__card"
              >
                <span className="portal-announcements__card-icon" aria-hidden>
                  <IconSpeakerphone size={20} stroke={1.5} />
                </span>
                <span className="portal-announcements__card-body">
                  <span className="portal-announcements__card-head">
                    <span className="portal-announcements__card-title">
                      {item.title}
                    </span>
                    <time
                      className="portal-announcements__card-date"
                      dateTime={item.createdAt}
                    >
                      {formatDate(item.createdAt)}
                    </time>
                  </span>
                  {item.message ? (
                    <span className="portal-announcements__card-preview">
                      {previewText(item.message)}
                    </span>
                  ) : null}
                </span>
                <IconChevronRight
                  size={18}
                  stroke={1.5}
                  className="portal-announcements__card-chevron"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
