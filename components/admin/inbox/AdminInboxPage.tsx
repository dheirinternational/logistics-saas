"use client"

import { DHEIRSelect } from "@/components/ui/DHEIRSelect"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import {
  IconBroadcast,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconMail,
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function AdminInboxPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sent, setSent] = useState<SentMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isBroadcast, setIsBroadcast] = useState(true)
  const [recipientId, setRecipientId] = useState<number | "">("")

  // Search states for specific customer selection
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const didFetch = useRef(false)

  const loadData = async () => {
    try {
      const [customersRes, sentRes] = await Promise.all([
        fetch("/api/users", { credentials: "include" }),
        fetch("/api/admin/inbox/send", { credentials: "include" }),
      ])
      const customersJson = await customersRes.json()
      const sentJson = await sentRes.json()
      if (customersJson.success) setCustomers(customersJson.data)
      if (sentJson.success) setSent(sentJson.data)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const term = searchQuery.toLowerCase()
    return customers.filter((c) => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
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
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="portal-home">
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Admin</p>
          <h1 className="portal-home__greeting-title">Inbox</h1>
          <p className="portal-home__greeting-sub">Compose and view messages sent to customers.</p>
        </div>
      </header>

      <div className="admin-inbox-grid">
        {/* Left Column: Compose Form */}
        <section className="portal-home__panel" aria-label="Compose Message form">
          <div className="portal-home__panel-head">
            <div>
              <h2 className="portal-home__section-title">Compose Message</h2>
              <p className="portal-home__section-sub">Write a new announcement or user message.</p>
            </div>
          </div>

          <form onSubmit={handleSend} className="portal-packages__form" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Target Select */}
            <label className="portal-packages__field">
              <span className="portal-packages__field-label">Send Target</span>
              <DHEIRSelect
                value={isBroadcast ? "true" : "false"}
                onChange={(e) => {
                  setIsBroadcast(e.target.value === "true")
                  setRecipientId("")
                  setSearchQuery("")
                }}
              >
                <option value="true">Broadcast to all customers</option>
                <option value="false">Send to a specific customer</option>
              </DHEIRSelect>
            </label>

            {/* Searchable Recipient Input (shown if direct message selected) */}
            {!isBroadcast && (
              <div className="portal-packages__field">
                <span className="portal-packages__field-label">Recipient</span>
                <div className="admin-inbox-search-container" ref={containerRef}>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="dheir-input"
                      style={{ paddingRight: "40px" }}
                      placeholder="Search by customer name, code, email..."
                      value={searchQuery}
                      autoComplete="off"
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setDropdownOpen(true)
                        if (!e.target.value) {
                          setRecipientId("")
                        }
                      }}
                      onFocus={() => setDropdownOpen(true)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("")
                          setRecipientId("")
                          setDropdownOpen(false)
                        }}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-dheir-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        <IconX size={16} />
                      </button>
                    )}
                  </div>

                  {dropdownOpen && (
                    <ul className="admin-inbox-search-results">
                      {filteredCustomers.length === 0 ? (
                        <li className="admin-inbox-search-btn" style={{ color: "var(--color-dheir-muted)", cursor: "default" }}>
                          No customers found
                        </li>
                      ) : (
                        filteredCustomers.map((c) => (
                          <li key={c.id} className="admin-inbox-search-item">
                            <button
                              type="button"
                              className="admin-inbox-search-btn"
                              onClick={() => {
                                setRecipientId(c.id)
                                setSearchQuery(`${c.first_name} ${c.last_name} (${c.code}) : ${c.email}`)
                                setDropdownOpen(false)
                              }}
                            >
                              {c.first_name} {c.last_name} ({c.code}) : {c.email}
                            </button>
                          </li>
                        ))
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

          <div style={{ padding: "24px" }}>
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
                              {msg.readCount} read
                            </span>
                          </div>
                        </div>
                        <div className="admin-inbox-sent-avatar">{initials}</div>
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
    </div>
  )
}
