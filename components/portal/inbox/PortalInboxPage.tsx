"use client"

import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import type { InboxMessage } from "@/lib/portal/inbox"
import {
  IconMailOpened,
  IconMail,
  IconBroadcast,
  IconUser,
  IconSearch,
  IconInbox,
} from "@tabler/icons-react"
import { useEffect, useRef, useState, useMemo } from "react"

type Props = {
  messages: InboxMessage[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function PortalInboxPage({ messages: initial }: Props) {
  const [messages, setMessages] = useState<InboxMessage[]>(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "broadcast" | "direct">("all")
  const markingRef = useRef<Set<string>>(new Set())

  // Revalidate on window focus (tab regains visibility)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return
      fetch("/api/inbox/messages", { credentials: "include" })
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setMessages(json.data)
        })
        .catch(() => {})
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [])

  const selectedMessage = useMemo(() => {
    return messages.find((m) => m.id === selectedId) || null
  }, [messages, selectedId])

  const handleSelect = (id: string) => {
    setSelectedId(id)

    if (!markingRef.current.has(id)) {
      const msg = messages.find((m) => m.id === id)
      if (msg && !msg.isRead) {
        markingRef.current.add(id)
        fetch(`/api/inbox/messages/${id}/read`, {
          method: "POST",
          credentials: "include",
        })
          .then(() => {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
            )
          })
          .catch(() => {})
      }
    }
  }

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesSearch =
        !search ||
        msg.title.toLowerCase().includes(search.toLowerCase()) ||
        msg.body.toLowerCase().includes(search.toLowerCase())

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "unread" && !msg.isRead) ||
        (activeTab === "broadcast" && msg.isBroadcast) ||
        (activeTab === "direct" && !msg.isBroadcast)

      return matchesSearch && matchesTab
    })
  }, [messages, search, activeTab])

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <div className="portal-account portal-inbox">
      <PortalPackagesPageHeader
        title="Inbox"
        description="Notifications and messages sent to you by DHEIR Cargo."
      />

      <div className="inbox-layout">
        {/* Left Sidebar Pane */}
        <div className="inbox-layout__sidebar">
          <div className="inbox-layout__search-container">
            <div className="inbox-layout__search-wrapper">
              <IconSearch size={16} className="inbox-layout__search-icon" aria-hidden />
              <input
                type="text"
                className="inbox-layout__search-input"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="inbox-layout__tabs">
            <button
              type="button"
              className={`inbox-layout__tab-btn${activeTab === "all" ? " is-active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`inbox-layout__tab-btn${activeTab === "unread" ? " is-active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
            <button
              type="button"
              className={`inbox-layout__tab-btn${activeTab === "broadcast" ? " is-active" : ""}`}
              onClick={() => setActiveTab("broadcast")}
            >
              Broadcasts
            </button>
            <button
              type="button"
              className={`inbox-layout__tab-btn${activeTab === "direct" ? " is-active" : ""}`}
              onClick={() => setActiveTab("direct")}
            >
              Direct
            </button>
          </div>

          <ul className="inbox-layout__list">
            {filteredMessages.length === 0 ? (
              <li className="inbox-layout__empty">
                <IconInbox size={32} className="inbox-layout__empty-icon" aria-hidden />
                <span className="inbox-layout__empty-text">No messages match this filter.</span>
              </li>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedId === msg.id
                const isUnread = !msg.isRead
                const initials = msg.title ? msg.title.trim().substring(0, 2) : "DH"

                return (
                  <li key={msg.id} className="inbox-layout__item">
                    <button
                      type="button"
                      className={`inbox-layout__card${isSelected ? " is-active" : ""}${
                        isUnread ? " is-unread" : ""
                      }`}
                      onClick={() => handleSelect(msg.id)}
                    >
                      <div className="inbox-layout__avatar">{initials}</div>
                      <div className="inbox-layout__card-details">
                        <div className="inbox-layout__card-header">
                          <span className="inbox-layout__card-title">{msg.title}</span>
                          <time className="inbox-layout__card-date" dateTime={msg.createdAt}>
                            {formatDate(msg.createdAt)}
                          </time>
                        </div>
                        <div className="inbox-layout__card-preview">
                          {msg.body}
                        </div>
                        <div className="inbox-layout__card-meta">
                          <span className="inbox-layout__card-badge">
                            {msg.isBroadcast ? "Broadcast" : "Direct"}
                          </span>
                          {isUnread && <span className="inbox-layout__unread-dot" />}
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>

        {/* Right Content Pane */}
        <div className="inbox-layout__content">
          {!selectedMessage ? (
            <div className="inbox-layout__empty">
              <IconMail size={40} stroke={1} className="inbox-layout__empty-icon" aria-hidden />
              <span className="inbox-layout__empty-text">Select a message from the list to view its details.</span>
            </div>
          ) : (
            <div className="inbox-layout__message">
              <div className="inbox-layout__message-header">
                <div className="inbox-layout__message-title-row">
                  <h2 className="inbox-layout__message-subject">{selectedMessage.title}</h2>
                  <span className="inbox-layout__card-badge">
                    {selectedMessage.isBroadcast ? "Broadcast Announcement" : "Direct Message"}
                  </span>
                </div>
                <div className="inbox-layout__sender-info">
                  <div className="inbox-layout__sender-avatar">DH</div>
                  <div className="inbox-layout__sender-meta">
                    <span className="inbox-layout__sender-name">DHEIR Cargo Administration</span>
                    <time className="inbox-layout__message-date" dateTime={selectedMessage.createdAt}>
                      Sent on {formatDate(selectedMessage.createdAt)}
                    </time>
                  </div>
                </div>
              </div>

              <div className="inbox-layout__message-body-container">
                <div className="inbox-layout__message-card">
                  <div className="inbox-layout__message-text">
                    {selectedMessage.body.trim().split("\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
