"use client"

import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import type { InboxMessage } from "@/lib/portal/inbox"
import { toast } from "@/lib/ui/toast"
import {
  IconArrowLeft,
  IconInbox,
  IconMail,
  IconMessage,
  IconSearch,
  IconSend,
} from "@tabler/icons-react"
import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
  messages: InboxMessage[]
  defaultChatOpen?: boolean
}

type ThreadReply = {
  id: string
  body: string
  senderRole: "admin" | "customer"
  senderId: number
  senderName: string
  customerCode: string | null
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function PortalInboxPage({ messages: initial, defaultChatOpen = false }: Props) {
  const [messages, setMessages] = useState<InboxMessage[]>(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "broadcast" | "direct">("all")
  const markingRef = useRef<Set<string>>(new Set())

  // Thread replies state
  const [threadReplies, setThreadReplies] = useState<ThreadReply[]>([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)
  const threadEndRef = useRef<HTMLDivElement>(null)

  // Revalidate on window focus
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

  // Auto-open support chat if defaultChatOpen or if URL has ?chat=admin
  useEffect(() => {
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
    const shouldOpenChat = defaultChatOpen || urlParams?.get("chat") === "admin"

    if (shouldOpenChat && messages.length > 0) {
      const supportMsg = messages.find((m) => !m.isBroadcast)
      if (supportMsg) {
        setSelectedId(supportMsg.id)
      } else {
        setSelectedId("support-chat")
      }
    }
  }, [defaultChatOpen, messages])

  const selectedMessage = useMemo(() => {
    if (!selectedId) return null
    if (selectedId === "support-chat") {
      return (
        messages.find((m) => !m.isBroadcast) || {
          id: "support-chat",
          title: "DHEIR Support",
          body: "Chat directly with DHEIR administration.",
          isBroadcast: false,
          isRead: true,
          createdAt: new Date().toISOString(),
        }
      )
    }
    return messages.find((m) => m.id === selectedId) || null
  }, [messages, selectedId])

  // Fetch thread conversation when selected message changes
  useEffect(() => {
    if (!selectedId) {
      setThreadReplies([])
      setReplyText("")
      return
    }
    let cancelled = false
    setLoadingThread(true)
    fetch(`/api/inbox/messages/${selectedId}/thread`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success) {
          setThreadReplies(json.data.replies || [])
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingThread(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  // Scroll to bottom of conversation thread when new reply is added
  useEffect(() => {
    if (threadReplies.length > 0) {
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [threadReplies.length])

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

  const handleOpenSupportChat = () => {
    const supportMsg = messages.find((m) => !m.isBroadcast)
    if (supportMsg) {
      handleSelect(supportMsg.id)
    } else {
      handleSelect("support-chat")
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = replyText.trim()
    if (!trimmed || !selectedId || sendingReply) return

    setSendingReply(true)
    try {
      const res = await fetch(`/api/inbox/messages/${selectedId}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || "Failed to send message")

      const newReply: ThreadReply = json.data
      setThreadReplies((prev) => [...prev, newReply])
      setReplyText("")

      // Update preview in messages list
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedId || (!m.isBroadcast && selectedId === "support-chat")
            ? { ...m, body: trimmed, createdAt: new Date().toISOString() }
            : m,
        ),
      )

      toast.success("Message sent")
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setSendingReply(false)
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
        <div className={`inbox-layout__sidebar${selectedId ? " is-hidden" : ""}`}>
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

          {/* Quick Chat with Admin Button */}
          <div style={{ padding: "0 16px 12px" }}>
            <button
              type="button"
              onClick={handleOpenSupportChat}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 16px",
                backgroundColor: "var(--color-dheir-blue)",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <IconMessage size={16} stroke={1.5} />
              <span>Chat with Admin</span>
            </button>
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
                const isSelected = selectedId === msg.id || (!msg.isBroadcast && selectedId === "support-chat")
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
                          <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)" }}>
                            {msg.isBroadcast ? "Broadcast" : "Direct"}
                          </span>
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
        <div className={`inbox-layout__content${!selectedId ? " is-hidden" : ""}`}>
          {!selectedMessage ? (
            <div className="inbox-layout__empty">
              <IconMail size={40} stroke={1} className="inbox-layout__empty-icon" aria-hidden />
              <span className="inbox-layout__empty-text">Select a message from the list or click Chat with Admin to start a conversation.</span>
            </div>
          ) : (
            <div className="inbox-layout__message">
              <div className="inbox-layout__message-header">
                <button
                  type="button"
                  className="inbox-layout__mobile-back"
                  onClick={() => setSelectedId(null)}
                >
                  <IconArrowLeft size={16} stroke={1.5} />
                  <span>Back to messages</span>
                </button>
                <div className="inbox-layout__message-title-row">
                  <h2 className="inbox-layout__message-subject">{selectedMessage.title}</h2>
                  <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)" }}>
                    {selectedMessage.isBroadcast ? "Broadcast Announcement" : "Direct Chat"}
                  </span>
                </div>
                <div className="inbox-layout__sender-info">
                  <div className="inbox-layout__sender-avatar">DH</div>
                  <div className="inbox-layout__sender-meta">
                    <span className="inbox-layout__sender-name">DHEIR Cargo Administration</span>
                    <time className="inbox-layout__message-date" dateTime={selectedMessage.createdAt}>
                      Sent on {formatDate(selectedMessage.createdAt)} at {formatTime(selectedMessage.createdAt)}
                    </time>
                  </div>
                </div>
              </div>

              <div className="inbox-layout__message-body-container">
                {/* Broadcast Announcement Body */}
                {selectedMessage.isBroadcast && (
                  <div
                    style={{
                      backgroundColor: "var(--color-dheir-surface)",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "16px",
                    }}
                  >
                    <div className="inbox-layout__message-text">
                      {selectedMessage.body.trim().split("\n").map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {loadingThread && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "16px" }}>
                    <DHEIRLoader size={8} color="var(--color-dheir-blue)" />
                  </div>
                )}

                {/* Direct Chat Welcome Notice if thread is empty */}
                {!selectedMessage.isBroadcast && !loadingThread && threadReplies.length === 0 && (
                  <div
                    style={{
                      backgroundColor: "var(--color-dheir-surface)",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "16px",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "var(--color-dheir-muted)",
                    }}
                  >
                    Welcome to DHEIR Cargo Support. Send a message below to start a chat with our administration team. We are here to help.
                  </div>
                )}

                {/* Conversation Thread Messages */}
                {threadReplies.length > 0 && (
                  <div style={{ margin: "20px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-dheir-muted)", fontWeight: 600 }}>
                      Conversation History
                    </div>

                    {threadReplies.map((reply) => {
                      const isMe = reply.senderRole === "customer"

                      return (
                        <div
                          key={reply.id}
                          style={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            maxWidth: "85%",
                            backgroundColor: isMe ? "var(--color-dheir-page)" : "rgba(0, 82, 255, 0.05)",
                            borderRadius: "8px",
                            padding: "14px 16px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "6px",
                              fontSize: "11px",
                              color: "var(--color-dheir-muted)",
                            }}
                          >
                            <span style={{ fontWeight: 600, color: isMe ? "var(--color-dheir-ink)" : "var(--color-dheir-blue)" }}>
                              {isMe ? "You" : "DHEIR Administration"}
                            </span>
                            <time dateTime={reply.createdAt}>
                              {formatDate(reply.createdAt)} {formatTime(reply.createdAt)}
                            </time>
                          </div>
                          <div style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--color-dheir-ink)", whiteSpace: "pre-wrap" }}>
                            {reply.body}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={threadEndRef} />
                  </div>
                )}

                {/* Message / Reply Form */}
                <form
                  onSubmit={handleSendReply}
                  style={{
                    marginTop: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <label htmlFor="inbox-reply-input" style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>
                    {selectedMessage.isBroadcast ? "Reply" : "Message Admin"}
                  </label>
                  <textarea
                    id="inbox-reply-input"
                    rows={4}
                    placeholder={selectedMessage.isBroadcast ? "Type your reply here..." : "Type your message to admin here..."}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "var(--color-dheir-page)",
                      color: "var(--color-dheir-ink)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={sendingReply || !replyText.trim()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "9px 18px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "var(--color-dheir-blue)",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: sendingReply || !replyText.trim() ? "not-allowed" : "pointer",
                        opacity: sendingReply || !replyText.trim() ? 0.6 : 1,
                      }}
                    >
                      {sendingReply ? (
                        <DHEIRLoader size={6} color="#fff" />
                      ) : (
                        <IconSend size={15} stroke={1.5} />
                      )}
                      <span>{selectedMessage.isBroadcast ? "Send reply" : "Send message"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
