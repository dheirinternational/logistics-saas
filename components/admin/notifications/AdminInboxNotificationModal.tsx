"use client"

import { IconBell, IconMessageCircle, IconX } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

type AdminThreadSummary = {
  rootId: string | null
  rootTitle: string
  isBroadcast: boolean
  customerId: number
  customerName: string
  customerCode: string | null
  latestBody: string
  latestSenderRole: "admin" | "customer"
  latestCreatedAt: string
  unreadCount: number
}

const DISMISSED_KEY = "dheir_admin_inbox_popup_dismissed_sigs"

function getThreadSig(t: AdminThreadSummary): string {
  return `${t.rootId ?? "direct"}:${t.customerId}:${t.unreadCount}:${t.latestCreatedAt}`
}

function getDismissedSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveDismissedSig(sig: string) {
  try {
    const set = getDismissedSet()
    set.add(sig)
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set).slice(-50)))
  } catch {
    // ignore storage errors
  }
}

export function AdminInboxNotificationModal() {
  const pathname = usePathname()
  const [unreadThreads, setUnreadThreads] = useState<AdminThreadSummary[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const lastSigRef = useRef("")

  const isOnAdminInbox = pathname?.startsWith("/admin/inbox")

  const fetchUnreadThreads = useCallback(async () => {
    if (isOnAdminInbox) {
      setIsOpen(false)
      return
    }
    try {
      const res = await fetch("/api/admin/inbox/threads", {
        credentials: "include",
        cache: "no-store",
      })
      if (!res.ok) return
      const json = await res.json()
      if (!json.success || !Array.isArray(json.data)) return

      const dismissed = getDismissedSet()
      const unread = (json.data as AdminThreadSummary[]).filter(
        (t) => Number(t.unreadCount) > 0 && !dismissed.has(getThreadSig(t)),
      )

      if (unread.length > 0) {
        const nextSig = unread.map(getThreadSig).join("|")
        if (nextSig !== lastSigRef.current) {
          lastSigRef.current = nextSig
          setUnreadThreads(unread)
          setCurrentIndex(0)
          setIsOpen(true)
        }
      } else {
        setUnreadThreads([])
        setIsOpen(false)
        lastSigRef.current = ""
      }
    } catch (err) {
      console.error("Failed to poll admin inbox notifications:", err)
    }
  }, [isOnAdminInbox])

  useEffect(() => {
    const initTimer = setTimeout(fetchUnreadThreads, 500)
    const pollTimer = setInterval(fetchUnreadThreads, 15000)
    window.addEventListener("focus", fetchUnreadThreads)
    window.addEventListener("dheir-inbox-updated", fetchUnreadThreads)

    return () => {
      clearTimeout(initTimer)
      clearInterval(pollTimer)
      window.removeEventListener("focus", fetchUnreadThreads)
      window.removeEventListener("dheir-inbox-updated", fetchUnreadThreads)
    }
  }, [fetchUnreadThreads])

  if (!isOpen || unreadThreads.length === 0 || isOnAdminInbox) return null

  const current = unreadThreads[currentIndex]
  if (!current) return null

  const handleDismissCurrent = () => {
    saveDismissedSig(getThreadSig(current))
    if (currentIndex < unreadThreads.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsOpen(false)
    }
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
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismissCurrent()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-inbox-popup-title"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-dheir-blue, #1a5fff)",
            color: "#ffffff",
            padding: "18px 22px",
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={handleDismissCurrent}
            aria-label="Dismiss notification"
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.18)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
          >
            <IconX size={16} stroke={2} />
          </button>

          <p
            style={{
              margin: "0 0 4px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.85)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <IconBell size={14} stroke={2} />
            NEW CUSTOMER MESSAGE ({current.unreadCount} unread)
          </p>
          <h2 id="admin-inbox-popup-title" style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#ffffff" }}>
            {current.customerName}
            {current.customerCode ? ` (${current.customerCode})` : ""}
          </h2>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
            Thread: {current.rootTitle}
          </div>

          <div
            style={{
              fontSize: "14px",
              lineHeight: 1.55,
              color: "#1e293b",
              backgroundColor: "#f8fafc",
              padding: "12px 14px",
              borderRadius: "10px",
              whiteSpace: "pre-wrap",
              maxHeight: "180px",
              overflowY: "auto",
            }}
          >
            {current.latestBody}
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              Received:{" "}
              {new Date(current.latestCreatedAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {unreadThreads.length > 1 && (
              <span style={{ fontWeight: 600, color: "#64748b" }}>
                {currentIndex + 1} of {unreadThreads.length}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/admin/inbox"
              onClick={() => {
                saveDismissedSig(getThreadSig(current))
                setIsOpen(false)
              }}
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--color-dheir-blue, #1a5fff)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <IconMessageCircle size={17} stroke={2} />
              Open &amp; Reply
            </Link>
            <button
              type="button"
              onClick={handleDismissCurrent}
              style={{
                padding: "11px 16px",
                borderRadius: "10px",
                backgroundColor: "#f1f5f9",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {unreadThreads.length > 1 && currentIndex < unreadThreads.length - 1 ? "Next" : "Dismiss"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
