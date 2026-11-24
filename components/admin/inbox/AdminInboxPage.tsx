"use client"

import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import {
  IconBroadcast,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconMail,
  IconMessage,
  IconSend,
  IconUser,
  IconX,
} from "@tabler/icons-react"
import { useEffect, useRef, useState, useMemo } from "react"
import { toast } from "@/lib/ui/toast"

type SentMessage = {
  id: string
  title: string
  body: string
  isBroadcast: boolean
  recipientName: string | null
  recipientEmail: string | null
  readCount: number
  createdAt: string
}

type Customer = {
  id: number
  email: string
  first_name: string
  last_name: string
  code: string
}

type AdminInquiryThread = {
  rootId: string
  rootTitle: string
  isBroadcast: boolean
  customerId: number
  customerName: string
  customerEmail: string
  customerCode: string | null
  latestBody: string
  latestSenderRole: "admin" | "customer"
  latestCreatedAt: string
  unreadCount: number
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

export function AdminInboxPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sent, setSent] = useState<SentMessage[]>([])
  const [inquiries, setInquiries] = useState<AdminInquiryThread[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Tabs: "inquiries" (customer replies) vs "compose" (broadcast/direct)
  const [activeTab, setActiveTab] = useState<"inquiries" | "compose">("inquiries")

  // Selected inquiry state
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiryThread | null>(null)
  const [inquiryRoot, setInquiryRoot] = useState<any | null>(null)
  const [inquiryReplies, setInquiryReplies] = useState<ThreadReply[]>([])
  const [loadingInquiryThread, setLoadingInquiryThread] = useState(false)
  const [adminReplyText, setAdminReplyText] = useState("")
  const [sendingAdminReply, setSendingAdminReply] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isBroadcast, setIsBroadcast] = useState(true)
  const [recipientId, setRecipientId] = useState<number | "">("")

  // Search states for specific customer selection
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const threadPanelRef = useRef<HTMLElement>(null)

  const didFetch = useRef(false)

  const refreshThreads = async () => {
    try {
      const inquiriesRes = await fetch("/api/admin/inbox/threads", {
        credentials: "include",
        cache: "no-store",
      })
      const inquiriesJson = await inquiriesRes.json()
      if (inquiriesJson.success && Array.isArray(inquiriesJson.data)) {
        setInquiries(inquiriesJson.data)
      }
    } catch {
      // ignore background poll failures
    }
  }

  const loadData = async () => {
    try {
      const [customersRes, sentRes, inquiriesRes] = await Promise.all([
        fetch("/api/users", { credentials: "include" }),
        fetch("/api/admin/inbox/send", { credentials: "include" }),
        fetch("/api/admin/inbox/threads", { credentials: "include", cache: "no-store" }),
      ])
      const customersJson = await customersRes.json()
      const sentJson = await sentRes.json()
      const inquiriesJson = await inquiriesRes.json()

      if (customersJson.success && Array.isArray(customersJson.data)) {
        const seen = new Set<number>()
        const deduped: Customer[] = []
        for (const raw of customersJson.data) {
          const cid = Number(raw?.id)
          if (!Number.isFinite(cid) || cid <= 0 || seen.has(cid)) continue
          seen.add(cid)
          deduped.push({
            id: cid,
            email: raw?.email ?? "",
            first_name: raw?.first_name ?? "",
            last_name: raw?.last_name ?? "",
            code: raw?.code ?? "",
          })
        }
        setCustomers(deduped)
      } else {
        toast.error(customersJson?.message || "Could not load customers list")
      }
      if (sentJson.success) setSent(sentJson.data)
      if (inquiriesJson.success && Array.isArray(inquiriesJson.data)) {
        setInquiries(inquiriesJson.data)
        if (inquiriesJson.data.length > 0) {
          setActiveTab("inquiries")
        }

        const params = new URLSearchParams(window.location.search)
        const targetCustomerId = Number(params.get("customerId"))
        const targetRootId = params.get("rootId")
        if (Number.isFinite(targetCustomerId) && targetCustomerId > 0) {
          const matched =
            (targetRootId
              ? inquiriesJson.data.find(
                  (inq: AdminInquiryThread) =>
                    inq.customerId === targetCustomerId && inq.rootId === targetRootId,
                )
              : null) ??
            inquiriesJson.data.find(
              (inq: AdminInquiryThread) => inq.customerId === targetCustomerId,
            ) ??
            null
          if (matched) {
            setActiveTab("inquiries")
            setSelectedInquiry(matched)
          }
        }
      }
    } catch {
      toast.error("Failed to load inbox data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (didFetch.current) return
    didFetch.current = true
    loadData()
  }, [])

  useEffect(() => {
    const timer = setInterval(refreshThreads, 30000)
    window.addEventListener("focus", refreshThreads)
    return () => {
      clearInterval(timer)
      window.removeEventListener("focus", refreshThreads)
    }
  }, [])

  // Load inquiry thread when selected
  useEffect(() => {
    if (!selectedInquiry) {
      setInquiryRoot(null)
      setInquiryReplies([])
      setAdminReplyText("")
      return
    }

    if (threadPanelRef.current) {
      threadPanelRef.current.scrollTop = 0
      if (window.innerWidth <= 1024) {
        threadPanelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }

    let cancelled = false
    setLoadingInquiryThread(true)

    // Mark as read for admin
    fetch(
      `/api/inbox/messages/${selectedInquiry.rootId}/read?scope=admin&customer_id=${selectedInquiry.customerId}`,
      {
        method: "POST",
        credentials: "include",
      },
    )
      .then((res) => {
        if (res.ok) window.dispatchEvent(new Event("dheir-inbox-updated"))
      })
      .catch(() => {})

    // Update unread count locally in list
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.rootId === selectedInquiry.rootId && inq.customerId === selectedInquiry.customerId
          ? { ...inq, unreadCount: 0 }
          : inq,
      ),
    )

    fetch(
      `/api/inbox/messages/${selectedInquiry.rootId}/thread?customer_id=${selectedInquiry.customerId}&scope=admin`,
      { credentials: "include", cache: "no-store" },
    )
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          if (json.success && json.data) {
            setInquiryRoot(json.data.root)
            setInquiryReplies(json.data.replies || [])
            window.dispatchEvent(new Event("dheir-inbox-updated"))
          } else {
            toast.error(json?.message || "Failed to load conversation thread")
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load conversation thread")
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingInquiryThread(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedInquiry])

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const selectedCustomer = useMemo(
    () => customers.find((c) => Number(c.id) === Number(recipientId)) ?? null,
    [customers, recipientId],
  )

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const term = searchQuery.toLowerCase().trim()
    return customers.filter((c) => {
      const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase()
      const memberCode = (c.code || "").toLowerCase()
      const email = (c.email || "").toLowerCase()
      const custId = String(c.id)

      return (
        fullName.includes(term) ||
        memberCode.includes(term) ||
        email.includes(term) ||
        custId.includes(term)
      )
    })
  }, [customers, searchQuery])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message body are required")
      return
    }
    if (!isBroadcast && !recipientId) {
      toast.error("Please select a recipient customer")
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/admin/inbox/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          is_broadcast: isBroadcast,
          recipient_id: isBroadcast ? undefined : Number(recipientId),
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)

      toast.success("Message sent successfully")
      setTitle("")
      setBody("")
      setRecipientId("")
      setSearchQuery("")
      setDropdownOpen(false)

      // Reload sent list
      const sentRes = await fetch("/api/admin/inbox/send", { credentials: "include" })
      const sentJson = await sentRes.json()
      if (sentJson.success) setSent(sentJson.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = adminReplyText.trim()
    if (!trimmed || !selectedInquiry || sendingAdminReply) return

    setSendingAdminReply(true)
    try {
      const res = await fetch(
        `/api/inbox/messages/${selectedInquiry.rootId}/reply?scope=admin`,
        {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: trimmed,
          recipient_id: selectedInquiry.customerId,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || "Failed to send reply")

      setInquiryReplies((prev) => [...prev, json.data])
      setAdminReplyText("")
      toast.success("Reply sent to customer")

      // Update inquiry list latest state
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.rootId === selectedInquiry.rootId && inq.customerId === selectedInquiry.customerId
            ? {
                ...inq,
                latestBody: trimmed,
                latestSenderRole: "admin",
                latestCreatedAt: new Date().toISOString(),
                unreadCount: 0,
              }
            : inq,
        ),
      )
      window.dispatchEvent(new Event("dheir-inbox-updated"))
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply")
    } finally {
      setSendingAdminReply(false)
    }
  }

  const totalUnreadInquiries = inquiries.reduce((sum, inq) => sum + inq.unreadCount, 0)

  return (
    <div className="portal-home">
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Admin</p>
          <h1 className="portal-home__greeting-title">Inbox</h1>
          <p className="portal-home__greeting-sub">
            Manage announcements, broadcast notifications, and customer inquiries.
          </p>
        </div>
      </header>

      {/* View Switcher Tabs */}
      <div className="admin-inbox-tabs" role="tablist" aria-label="Inbox sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "inquiries"}
          className={`admin-inbox-tab${activeTab === "inquiries" ? " is-active" : ""}`}
          onClick={() => setActiveTab("inquiries")}
        >
          Customer Inquiries {totalUnreadInquiries > 0 ? `(${totalUnreadInquiries})` : ""}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "compose"}
          className={`admin-inbox-tab${activeTab === "compose" ? " is-active" : ""}`}
          onClick={() => setActiveTab("compose")}
        >
          Compose and Sent Log
        </button>
      </div>

      {/* VIEW 1: Customer Inquiries / Replies */}
      {activeTab === "inquiries" && (
        <div className="admin-inbox-grid admin-inbox-grid--inquiries">
          {/* Inquiries List */}
          <section className="portal-home__panel" aria-label="Customer threads">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">
                  Customer Threads ({inquiries.length})
                </h2>
                <p className="portal-home__section-sub">
                  Select a conversation to read and respond.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "16px 0" }}>
                <DHEIRLoader size={8} color="var(--color-dheir-blue)" />
                <span style={{ fontSize: "13px", color: "var(--color-dheir-muted)" }}>Loading customer threads...</span>
              </div>
            ) : inquiries.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--color-dheir-muted)", margin: 0 }}>
                No customer inquiries yet.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {inquiries.map((inq) => {
                  const isSelected =
                    selectedInquiry?.rootId === inq.rootId &&
                    selectedInquiry?.customerId === inq.customerId

                  return (
                    <li key={`${inq.rootId}-${inq.customerId}`}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        className={`admin-inbox-thread-btn${isSelected ? " is-active" : ""}`}
                        onClick={() => {
                          setSelectedInquiry({ ...inq })
                          setTimeout(() => window.dispatchEvent(new Event("dheir-inbox-updated")), 500)
                        }}
                      >
                        <span className="admin-inbox-thread-main">
                          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>
                              {inq.customerName} {inq.customerCode ? `(${inq.customerCode})` : ""}
                            </span>
                            <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)", flexShrink: 0 }}>
                              {formatDate(inq.latestCreatedAt)}
                            </span>
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--color-dheir-blue)", fontWeight: 500 }}>
                            {inq.rootTitle}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--color-dheir-muted)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {inq.latestSenderRole === "customer" ? "Customer: " : "Admin: "}
                            {inq.latestBody}
                          </span>
                          {inq.unreadCount > 0 && (
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-dheir-blue)" }}>
                              {inq.unreadCount} unread
                            </span>
                          )}
                        </span>
                        <span className="admin-inbox-thread-caret" aria-hidden>
                          <IconChevronRight size={16} stroke={1.75} />
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Inquiry Thread Details & Reply Form */}
          <section
            ref={threadPanelRef}
            className="portal-home__panel admin-inbox-thread-panel"
            aria-label="Conversation thread"
          >
            {!selectedInquiry ? (
              <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--color-dheir-muted)", fontSize: "13px" }}>
                Select a customer inquiry to view conversation and reply.
              </div>
            ) : (
              <div>
                {/* Header */}
                <div style={{ marginBottom: "16px", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--color-dheir-ink)" }}>
                      {selectedInquiry.rootTitle}
                    </h2>
                    <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)" }}>
                      {selectedInquiry.isBroadcast ? "Broadcast reply" : "Direct inquiry"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-dheir-muted)", marginTop: "4px" }}>
                    Customer: <strong>{selectedInquiry.customerName}</strong> {selectedInquiry.customerCode ? `(${selectedInquiry.customerCode})` : ""} · {selectedInquiry.customerEmail}
                  </div>
                </div>

                {loadingInquiryThread ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}>
                    <DHEIRLoader size={8} color="var(--color-dheir-blue)" />
                  </div>
                ) : (
                  <>
                    {/* Root Message Box */}
                    {inquiryRoot && (
                      <div
                        style={{
                          backgroundColor: "var(--color-dheir-page)",
                          borderRadius: "8px",
                          padding: "14px 16px",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ fontSize: "11px", color: "var(--color-dheir-muted)", marginBottom: "4px" }}>
                          Original Announcement / Message · {formatDate(inquiryRoot.createdAt)}
                        </div>
                        <div style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--color-dheir-ink)", whiteSpace: "pre-wrap" }}>
                          {inquiryRoot.body}
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
                      {inquiryReplies.map((reply) => {
                        const isCustomer = reply.senderRole === "customer"

                        return (
                          <div
                            key={reply.id}
                            style={{
                              alignSelf: isCustomer ? "flex-start" : "flex-end",
                              maxWidth: "85%",
                              backgroundColor: isCustomer ? "var(--color-dheir-page)" : "rgba(0, 82, 255, 0.06)",
                              borderRadius: "8px",
                              padding: "12px 14px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "4px",
                                fontSize: "11px",
                                color: "var(--color-dheir-muted)",
                              }}
                            >
                              <span style={{ fontWeight: 600, color: isCustomer ? "var(--color-dheir-ink)" : "var(--color-dheir-blue)" }}>
                                {reply.senderName}
                              </span>
                              <span>
                                {formatDate(reply.createdAt)} {formatTime(reply.createdAt)}
                              </span>
                            </div>
                            <div style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--color-dheir-ink)", whiteSpace: "pre-wrap" }}>
                              {reply.body}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Admin Reply Form */}
                    <form
                      onSubmit={handleSendAdminReply}
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <label htmlFor="admin-reply-input" style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-dheir-ink)" }}>
                        Reply to {selectedInquiry.customerName}
                      </label>
                      <textarea
                        id="admin-reply-input"
                        rows={3}
                        className="dheir-input"
                        placeholder="Write your response to the customer..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        style={{ resize: "vertical" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="submit"
                          className="portal-home__btn portal-home__btn--primary"
                          disabled={sendingAdminReply || !adminReplyText.trim()}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          {sendingAdminReply ? (
                            <DHEIRLoader size={6} color="#fff" />
                          ) : (
                            <IconSend size={15} stroke={1.5} />
                          )}
                          <span>Send reply</span>
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* VIEW 2: Compose & Sent Log */}
      {activeTab === "compose" && (
        <div className="admin-inbox-grid">
          {/* Left Column: Compose Form */}
          <section className="portal-home__panel admin-inbox-compose-panel" aria-label="Compose new message">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Send a Message</h2>
                <p className="portal-home__section-sub">Deliver updates to all or a specific customer.</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="admin-inbox-form">
              {/* Message Type Toggle */}
              <div className="admin-inbox-toggle-group">
                <span className="admin-inbox-label">Recipient Mode</span>
                <div className="admin-inbox-toggles" role="group" aria-label="Recipient Mode">
                  <button
                    type="button"
                    aria-pressed={isBroadcast}
                    className={`admin-inbox-toggle-btn${isBroadcast ? " is-active" : ""}`}
                    onClick={() => {
                      setIsBroadcast(true)
                      setRecipientId("")
                      setSearchQuery("")
                      setDropdownOpen(false)
                    }}
                  >
                    <IconBroadcast size={18} stroke={1.5} aria-hidden />
                    <span>Broadcast to All Customers</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={!isBroadcast}
                    className={`admin-inbox-toggle-btn${!isBroadcast ? " is-active" : ""}`}
                    onClick={() => {
                      setIsBroadcast(false)
                      setDropdownOpen(true)
                    }}
                  >
                    <IconUser size={18} stroke={1.5} aria-hidden />
                    <span>Specific Customer</span>
                  </button>
                </div>
              </div>

              {/* Specific Customer Autocomplete Search Picker */}
              {!isBroadcast && (
                <div className="portal-packages__field">
                  <label htmlFor="admin-inbox-customer-search" className="portal-packages__field-label">
                    Target Customer
                  </label>
                  <div className="admin-inbox-search-container" ref={containerRef}>
                    <div style={{ position: "relative" }}>
                      <input
                        id="admin-inbox-customer-search"
                        type="text"
                        className="dheir-input"
                        style={{ paddingRight: "64px" }}
                        placeholder="Search by customer name, code, email..."
                        value={searchQuery}
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={dropdownOpen}
                        aria-controls="admin-inbox-customer-listbox"
                        aria-autocomplete="list"
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setDropdownOpen(true)
                          setRecipientId("")
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        onClick={() => setDropdownOpen(true)}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          aria-label="Clear selected customer"
                          onClick={() => {
                            setSearchQuery("")
                            setRecipientId("")
                            setDropdownOpen(true)
                          }}
                          style={{
                            position: "absolute",
                            right: "36px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--color-dheir-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                          }}
                        >
                          <IconX size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={dropdownOpen ? "Hide customer list" : "Show customer list"}
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-dheir-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px",
                        }}
                      >
                        {dropdownOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                      </button>
                    </div>

                    {selectedCustomer && (
                      <div className="admin-inbox-selected-pill">
                        <span>
                          Selected: {`${selectedCustomer.first_name} ${selectedCustomer.last_name}`.trim()}
                          {selectedCustomer.code ? ` (${selectedCustomer.code})` : ""}
                        </span>
                        <IconCheck size={15} stroke={2} aria-hidden />
                      </div>
                    )}

                    {dropdownOpen && (
                      <ul
                        id="admin-inbox-customer-listbox"
                        role="listbox"
                        className="admin-inbox-search-results"
                      >
                        {loading ? (
                          <li className="admin-inbox-search-btn" style={{ color: "var(--color-dheir-muted)", cursor: "default" }}>
                            Loading customers...
                          </li>
                        ) : filteredCustomers.length === 0 ? (
                          <li className="admin-inbox-search-btn" style={{ color: "var(--color-dheir-muted)", cursor: "default" }}>
                            No customers found
                          </li>
                        ) : (
                          filteredCustomers.map((c) => {
                            const fullName = `${c.first_name} ${c.last_name}`.trim() || c.email
                            const isPicked = Number(recipientId) === Number(c.id)
                            return (
                              <li key={c.id} className="admin-inbox-search-item" role="option" aria-selected={isPicked}>
                                <button
                                  type="button"
                                  className={`admin-inbox-search-btn${isPicked ? " is-selected" : ""}`}
                                  onClick={() => {
                                    setRecipientId(c.id)
                                    setSearchQuery(
                                      c.code
                                        ? `${fullName} (${c.code}) : ${c.email}`
                                        : `${fullName} : ${c.email}`,
                                    )
                                    setDropdownOpen(false)
                                  }}
                                >
                                  <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                    <span style={{ fontWeight: 600, color: "var(--color-dheir-ink)" }}>
                                      {fullName} {c.code ? `(${c.code})` : ""}
                                    </span>
                                    <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)" }}>
                                      {c.email}
                                    </span>
                                  </span>
                                  {isPicked && <IconCheck size={16} stroke={2} style={{ color: "var(--color-dheir-blue)", flexShrink: 0 }} />}
                                </button>
                              </li>
                            )
                          })
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Subject */}
              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Subject</span>
                <input
                  type="text"
                  className="dheir-input"
                  placeholder="Message subject line"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              {/* Message Body */}
              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Message Body</span>
                <textarea
                  className="dheir-input"
                  placeholder="Write message contents here..."
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  style={{ resize: "vertical" }}
                />
              </label>

              <button
                type="submit"
                className="portal-home__btn portal-home__btn--primary"
                disabled={sending}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", alignSelf: "start" }}
              >
                {sending ? (
                  <DHEIRLoader size={8} color="#fff" />
                ) : (
                  <IconSend size={18} stroke={1.5} aria-hidden />
                )}
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </section>

          {/* Right Column: Sent log list */}
          <section className="portal-home__panel" aria-label="Sent messages log">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Sent Log</h2>
                <p className="portal-home__section-sub">History of notifications sent to customers.</p>
              </div>
            </div>

            <div>
              {loading ? (
                <div className="admin-inbox__loading" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <DHEIRLoader size={8} color="var(--color-dheir-blue)" />
                  <span>Loading sent messages...</span>
                </div>
              ) : sent.length === 0 ? (
                <p className="admin-inbox__empty">No messages sent yet.</p>
              ) : (
                <ul className="admin-inbox-sent-list">
                  {sent.map((msg) => {
                    const isOpen = expandedId === msg.id
                    const initials = msg.isBroadcast ? "BC" : "DM"

                    return (
                      <li key={msg.id} className="admin-inbox-sent-item">
                        <button
                          type="button"
                          className="admin-inbox-sent-card"
                          onClick={() => setExpandedId(isOpen ? null : msg.id)}
                          aria-expanded={isOpen}
                        >
                          <div className="admin-inbox-sent-details">
                            <div className="admin-inbox-sent-title">{msg.title}</div>
                            <div className="admin-inbox-sent-meta">
                              <span className="admin-inbox-sent-badge">
                                {msg.isBroadcast ? "Broadcast" : "Direct"}
                              </span>
                              <span className="admin-inbox-sent-badge">
                                To: {msg.isBroadcast
                                  ? "All Customers"
                                  : msg.recipientName ?? msg.recipientEmail ?? "None"}
                              </span>
                              <span className="admin-inbox-sent-read">
                                <IconCheck size={12} stroke={2} style={{ display: "inline", marginRight: "3px" }} aria-hidden />
                                {msg.isBroadcast
                                  ? `${msg.readCount} read`
                                  : msg.readCount > 0
                                    ? "Read by customer"
                                    : "Delivered (Unread)"}
                              </span>
                            </div>
                          </div>
                          <div className="admin-inbox-sent-avatar">{initials}</div>
                          <span className="admin-inbox-sent-caret" aria-hidden>
                            {isOpen ? (
                              <IconChevronUp size={18} stroke={1.75} />
                            ) : (
                              <IconChevronDown size={18} stroke={1.75} />
                            )}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="admin-inbox-sent-body">
                            {msg.body.trim().split("\n").map((para, i) => (
                              <p key={i}>{para}</p>
                            ))}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
