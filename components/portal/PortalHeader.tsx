"use client"

import { PortalHeaderCart } from "@/components/portal/PortalHeaderCart"
import { PortalReviewModal } from "@/components/portal/PortalReviewModal"
import { getPortalSearchHref } from "@/lib/portal/search"
import { IconBell, IconMenu2, IconSearch, IconStar } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useId, useRef, useState } from "react"

type Announcement = {
  id: string
  title: string
  message: string
  created_at?: string
}

type PortalHeaderProps = {
  onOpenMenu: () => void
  menuExpanded: boolean
}

export function PortalHeader({ onOpenMenu, menuExpanded }: PortalHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchId = useId()
  const notificationsId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoaded, setAnnouncementsLoaded] = useState(false)

  useEffect(() => {
    const next = (searchParams.get("search") ?? "").trim()
    setQuery(next)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    fetch("/api/announcements", { credentials: "include" })
      .then(async (res) => {
        const result = await res.json()
        if (!res.ok || cancelled) return
        setAnnouncements(Array.isArray(result.data) ? result.data : [])
      })
      .catch(() => {
        if (!cancelled) setAnnouncements([])
      })
      .finally(() => {
        if (!cancelled) setAnnouncementsLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!notificationsOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onEscape)
    }
  }, [notificationsOpen])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push(getPortalSearchHref(query, pathname))
  }

  const hasAnnouncements = announcements.length > 0

  return (
    <>
      <header className="portal-header">
        <button
          type="button"
          className="portal-header__menu"
          onClick={onOpenMenu}
          aria-expanded={menuExpanded}
          aria-controls="portal-sidebar"
        >
          <IconMenu2 size={22} stroke={1.5} aria-hidden />
          <span className="sr-only">Open menu</span>
        </button>

        <form className="portal-header__search" onSubmit={handleSearch} role="search">
          <label htmlFor={searchId} className="sr-only">
            Search packages or products
          </label>
          <IconSearch
            size={18}
            stroke={1.5}
            className="portal-header__search-icon"
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search packages, tracking, products…"
            className="portal-header__search-input"
            autoComplete="off"
          />
        </form>

        <div className="portal-header__end">
          <PortalHeaderCart />

          <button
            type="button"
            className="portal-header__review-btn"
            onClick={() => setReviewOpen(true)}
          >
            <IconStar size={20} stroke={1.5} aria-hidden />
            <span className="portal-header__review-label">Add review</span>
          </button>

          <div className="portal-header__actions" ref={panelRef}>
            <button
              type="button"
              className="portal-header__icon-btn"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-expanded={notificationsOpen}
              aria-controls={notificationsId}
              aria-label="Announcements"
            >
              <IconBell size={22} stroke={1.5} aria-hidden />
              {hasAnnouncements ? (
                <span className="portal-header__badge" aria-hidden />
              ) : null}
            </button>

            {notificationsOpen ? (
              <div
                id={notificationsId}
                className="portal-header__notifications"
                role="dialog"
                aria-label="Announcements"
              >
                <p className="portal-header__notifications-title">Announcements</p>
                {!announcementsLoaded ? (
                  <p className="portal-header__notifications-empty">Loading…</p>
                ) : announcements.length === 0 ? (
                  <p className="portal-header__notifications-empty">
                    No announcements right now.
                  </p>
                ) : (
                  <ul className="portal-header__notifications-list">
                    {announcements.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/base/announcements/${item.id}`}
                          className="portal-header__notification-link"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <span className="portal-header__notification-title">
                            {item.title}
                          </span>
                          {item.message ? (
                            <span className="portal-header__notification-preview">
                              {item.message}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="portal-header__notifications-foot">
                  <Link
                    href="/base/announcements"
                    className="portal-header__notifications-view-all"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View all
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <PortalReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </>
  )
}
