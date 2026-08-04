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

  type UnifiedNotification = {
    id: string
    title: string
    message: string
    createdAt: string
    isRead: boolean
    isInbox: boolean
  }

  const [query, setQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([])
  const [notificationsLoaded, setNotificationsLoaded] = useState(false)

  useEffect(() => {
    const next = (searchParams.get("search") ?? "").trim()
    setQuery(next)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    const fetchNotifications = async () => {
      try {
        const [annRes, inboxRes] = await Promise.all([
          fetch("/api/announcements", { credentials: "include" }),
          fetch("/api/inbox/messages", { credentials: "include" }),
        ])

        const annResult = await annRes.json()
        const inboxResult = await inboxRes.json()

        if (cancelled) return

        const mappedAnnouncements: UnifiedNotification[] = (Array.isArray(annResult.data) ? annResult.data : []).map(
          (ann: any) => ({
            id: ann.id,
            title: ann.title,
            message: ann.message || "",
            createdAt: ann.created_at || new Date().toISOString(),
            isRead: true, // announcements are general and don't have personal read receipts
            isInbox: false,
          })
        )

        const mappedInbox: UnifiedNotification[] = (Array.isArray(inboxResult.data) ? inboxResult.data : []).map(
          (msg: any) => ({
            id: msg.id,
            title: msg.title,
            message: msg.body || "",
            createdAt: msg.createdAt || new Date().toISOString(),
            isRead: Boolean(msg.isRead),
            isInbox: true,
          })
        )

        const combined = [...mappedAnnouncements, ...mappedInbox].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setNotifications(combined)
      } catch (err) {
        console.error("Error fetching notifications", err)
      } finally {
        if (!cancelled) setNotificationsLoaded(true)
      }
    }

    fetchNotifications()

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

  const hasUnread = notifications.some((n) => n.isInbox && !n.isRead)

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
          {/* <PortalHeaderCart /> */}

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
              aria-label="Notifications"
            >
              <IconBell size={22} stroke={1.5} aria-hidden />
              {hasUnread ? (
                <span className="portal-header__badge" aria-hidden />
              ) : null}
            </button>

            {notificationsOpen ? (
              <div
                id={notificationsId}
                className="portal-header__notifications"
                role="dialog"
                aria-label="Notifications"
              >
                <p className="portal-header__notifications-title">Notifications</p>
                {!notificationsLoaded ? (
                  <p className="portal-header__notifications-empty">Loading…</p>
                ) : notifications.length === 0 ? (
                  <p className="portal-header__notifications-empty">
                    No notifications right now.
                  </p>
                ) : (
                  <ul className="portal-header__notifications-list">
                    {notifications.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.isInbox ? "/customer/inbox" : `/customer/announcements/${item.id}`}
                          className="portal-header__notification-link"
                          onClick={() => setNotificationsOpen(false)}
                          style={{
                            backgroundColor: item.isInbox && !item.isRead ? "rgba(var(--color-dheir-blue-rgb), 0.05)" : "transparent"
                          }}
                        >
                          <span className="portal-header__notification-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {item.isInbox && !item.isRead && (
                              <span style={{ width: "6px", height: "6px", backgroundColor: "var(--color-dheir-blue)", borderRadius: "50%", display: "inline-block" }} />
                            )}
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
                    href="/customer/inbox"
                    className="portal-header__notifications-view-all"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View Inbox
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
