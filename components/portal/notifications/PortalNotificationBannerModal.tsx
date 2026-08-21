"use client"

import { IconBell, IconCheck, IconX } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react"

type InboxMessage = {
  id: string
  title: string
  body: string
  isBroadcast: boolean
  isRead: boolean
  createdAt: string
}

export function PortalNotificationBannerModal() {
  const [unreadMessages, setUnreadMessages] = useState<InboxMessage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/inbox/messages", { credentials: "include" })
        if (!res.ok) return
        const result = await res.json()
        if (!result.success || !Array.isArray(result.data)) return

        const unread = result.data.filter((msg: InboxMessage) => !msg.isRead)
        if (isMounted && unread.length > 0) {
          setUnreadMessages(unread)
          setCurrentIndex(0)
          // Small delay for smooth pop animation
          setTimeout(() => setIsOpen(true), 500)
        }
      } catch (err) {
        console.error("Error fetching unread notifications for banner popup:", err)
      }
    }

    fetchUnread()

    return () => {
      isMounted = false
    }
  }, [])

  if (!isOpen || unreadMessages.length === 0) return null

  const currentMsg = unreadMessages[currentIndex]
  if (!currentMsg) return null

  const handleMarkAsRead = async () => {
    try {
      await fetch(`/api/inbox/messages/${currentMsg.id}/read`, {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }

    // Move to next unread message or close
    if (currentIndex < unreadMessages.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    handleMarkAsRead()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "dheirFadeIn 200ms ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--color-dheir-border, #e2e8f0)",
          animation: "dheirPopUp 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            backgroundColor: "#1e293b",
            color: "#ffffff",
            padding: "20px 24px 18px",
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)")}
          >
            <IconX size={18} stroke={2} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <IconBell size={16} style={{ color: "#38bdf8" }} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#38bdf8",
              }}
            >
              {currentMsg.isBroadcast ? "BROADCAST ANNOUNCEMENT" : "NEW NOTIFICATION"}
            </span>
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#ffffff",
            }}
          >
            {currentMsg.title}
          </h3>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "20px 24px 24px",
            maxHeight: "70vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "var(--color-dheir-ink, #334155)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {currentMsg.body}
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "12px",
            }}
          >
            <span>
              Received: {new Date(currentMsg.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {unreadMessages.length > 1 && (
              <span style={{ fontWeight: 600, color: "#64748b" }}>
                {currentIndex + 1} of {unreadMessages.length}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={handleMarkAsRead}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "var(--color-dheir-blue, #1a5fff)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "opacity 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <IconCheck size={18} stroke={2.5} />
              {unreadMessages.length > 1 && currentIndex < unreadMessages.length - 1
                ? "Got it, Next"
                : "Got it, Dismiss"}
            </button>
            <Link
              href="/customer/inbox"
              onClick={() => {
                handleMarkAsRead()
              }}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                backgroundColor: "#f1f5f9",
                color: "#334155",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 150ms ease",
              }}
            >
              View Inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
