import { IconSpeakerphone } from "@tabler/icons-react"
import Link from "next/link"

type Announcement = {
  id: string
  title: string
  message: string
}

type PortalHomeAnnouncementsProps = {
  announcements: Announcement[]
}

export function PortalHomeAnnouncements({
  announcements,
}: PortalHomeAnnouncementsProps) {
  if (announcements.length === 0) return null

  return (
    <section className="portal-home__section">
      <div className="portal-home__section-head">
        <h2 className="portal-home__section-title">Announcements</h2>
      </div>
      <ul className="portal-home__announcements">
        {announcements.map((item) => (
          <li key={item.id}>
            <Link
              href={`/base/announcements/${item.id}`}
              className="portal-home__announcement-item"
            >
              <IconSpeakerphone
                size={18}
                stroke={1.5}
                className="portal-home__announcement-icon"
                aria-hidden
              />
              <span className="portal-home__announcement-body">
                <span className="portal-home__announcement-title">
                  {item.title}
                </span>
                {item.message ? (
                  <span className="portal-home__announcement-preview">
                    {item.message}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
