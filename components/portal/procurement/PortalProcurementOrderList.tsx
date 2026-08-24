"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { IconMessageCircle, IconClock, IconFileCheck, IconSend, IconPhoto, IconX, IconTrash } from "@tabler/icons-react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"

type ProcurementItem = {
  id: number
  created_at: string
  reference_number: string
  request_type: "procurement" | "sourcing" | "verification"
  status: string
  title: string
  product_url?: string
  target_price_rmb?: number
  quantity: number
  variant_details?: string
  quality_grade?: string
  target_budget?: number
  supplier_name?: string
  quote_total?: number
  quote_notes?: string
  admin_reply?: string
  customer_note?: string
  commitment_fee: number
  commitment_fee_paid: boolean
  images?: { id: number; image_url: string }[]
  message_count?: number
}

type MessageItem = {
  id: number
  created_at: string
  sender_role: "customer" | "admin"
  message: string
  attachment_url?: string
}

export function PortalProcurementOrderList({ refreshKey }: { refreshKey: number }) {
  const [requests, setRequests] = useState<ProcurementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ProcurementItem | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loadingChat, setLoadingChat] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/customer/procurement", { credentials: "include" })
      const json = await res.json()
      if (res.ok && json.success) {
        setRequests(json.data || [])
      } else {
        toast.error(json.message || "Failed to load procurement requests")
      }
    } catch {
      toast.error("Network error while loading requests")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this procurement request?")) {
      return
    }
    try {
      const res = await fetch(`/api/customer/procurement/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success("Procurement request deleted!")
        if (selectedRequest?.id === id) setSelectedRequest(null)
        fetchList()
      } else {
        toast.error(json.message || "Failed to delete request")
      }
    } catch {
      toast.error("Network error deleting request")
    }
  }

  useEffect(() => {
    fetchList()
  }, [refreshKey])

  const openDetail = async (req: ProcurementItem) => {
    setSelectedRequest(req)
    setLoadingChat(true)
    try {
      const res = await fetch(`/api/customer/procurement/${req.id}`, { credentials: "include" })
      const json = await res.json()
      if (res.ok && json.success) {
        setMessages(json.data.messages || [])
      }
    } catch {
      toast.error("Could not load message history")
    } finally {
      setLoadingChat(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest || !newMessage.trim()) return

    setSendingMessage(true)
    try {
      const res = await fetch(`/api/customer/procurement/${selectedRequest.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: newMessage.trim() }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setMessages((prev) => [...prev, json.data])
        setNewMessage("")
      } else {
        toast.error(json.message || "Could not send message")
      }
    } catch {
      toast.error("Network error sending message")
    } finally {
      setSendingMessage(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <span className="portal-packages__badge portal-packages__badge--blue">Under Review</span>
      case "quoted":
        return <span className="portal-packages__badge portal-packages__badge--orange">Quotation Ready</span>
      case "committed":
        return <span className="portal-packages__badge portal-packages__badge--green">Fee Paid</span>
      case "purchased":
        return <span className="portal-packages__badge portal-packages__badge--blue">Purchased in China</span>
      case "warehouse_arrived":
        return <span className="portal-packages__badge portal-packages__badge--green">Arrived at China Warehouse</span>
      case "completed":
        return <span className="portal-packages__badge portal-packages__badge--green">Completed</span>
      default:
        return <span className="portal-packages__badge portal-packages__badge--muted">{status.replaceAll("_", " ")}</span>
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {loading ? (
        <div style={{ padding: "80px 0", display: "flex", justifyContent: "center" }}>
          <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
        </div>
      ) : requests.length === 0 ? (
        <div className="portal-packages__empty">
          <p>No procurement or sourcing requests found yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {requests.map((item) => (
            <article
              key={item.id}
              className="portal-packages__card"
              style={{
                cursor: "pointer",
                transition: "border-color 150ms ease",
              }}
              onClick={() => openDetail(item)}
            >
              <div className="portal-packages__card-head" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-dheir-muted)", letterSpacing: "0.05em" }}>
                    {item.request_type} · {item.reference_number}
                  </span>
                  <h3 className="portal-packages__card-title" style={{ marginTop: "4px" }}>
                    {item.title}
                  </h3>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="portal-packages__card-body" style={{ marginTop: "12px" }}>
                <ul className="portal-packages__details-list">
                  <li>
                    <strong>Quantity:</strong> {item.quantity} {item.quantity === 1 ? "unit" : "units"}
                  </li>
                  {item.target_price_rmb ? (
                    <li>
                      <strong>Target Price:</strong> ¥{Number(item.target_price_rmb).toFixed(2)} RMB
                    </li>
                  ) : null}
                  {item.quote_total ? (
                    <li>
                      <strong>Quotation Total:</strong> ₦{Number(item.quote_total).toLocaleString()}
                    </li>
                  ) : null}
                  <li>
                    <strong>Submitted:</strong> {new Date(item.created_at).toLocaleDateString()}
                  </li>
                </ul>

                {item.admin_reply && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-dheir-blue)", textTransform: "uppercase" }}>
                      Admin Sourcing Update:
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--color-dheir-ink)" }}>{item.admin_reply}</p>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--color-dheir-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--color-dheir-muted)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <IconMessageCircle size={16} stroke={1.5} />
                  {item.message_count ? `${item.message_count} messages in thread` : "Start chat with procurement team"}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid #fca5a5",
                      backgroundColor: "#fef2f2",
                      color: "#ef4444",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRequest(item.id)
                    }}
                    title="Delete Request"
                  >
                    <IconTrash size={14} stroke={1.5} />
                    Delete
                  </button>
                  <button
                    type="button"
                    className="portal-home__btn portal-home__btn--secondary"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                  >
                    View Details & Chat
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail & Chat Modal */}
      {selectedRequest && (
        <div
          className="dheir-dialog-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRequest(null)
          }}
        >
          <div className="dheir-dialog admin-modal" role="dialog" aria-modal="true" style={{ maxWidth: "680px" }}>
            <div className="dheir-dialog__head" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-dheir-muted)" }}>
                  {selectedRequest.request_type} · {selectedRequest.reference_number}
                </span>
                <h2 className="dheir-dialog__title" style={{ marginTop: "2px" }}>
                  {selectedRequest.title}
                </h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #fca5a5",
                    backgroundColor: "#fef2f2",
                    color: "#ef4444",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => handleDeleteRequest(selectedRequest.id)}
                >
                  <IconTrash size={14} stroke={1.5} />
                  Delete Request
                </button>
                <button
                  type="button"
                  className="dheir-dialog__close"
                  onClick={() => setSelectedRequest(null)}
                  aria-label="Close"
                >
                  <IconX size={20} stroke={1.5} />
                </button>
              </div>
            </div>

            <div className="admin-modal__body" style={{ maxHeight: "75vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Order Meta Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--color-dheir-surface)", border: "1px solid var(--color-dheir-border)" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)" }}>Status</span>
                  <div style={{ marginTop: "4px" }}>{getStatusBadge(selectedRequest.status)}</div>
                </div>

                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--color-dheir-surface)", border: "1px solid var(--color-dheir-border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)" }}>Commitment Fee</span>
                    <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: 700, color: "var(--color-dheir-ink)" }}>
                      ₦{Number(selectedRequest.commitment_fee || 0).toLocaleString()}
                    </p>
                  </div>
                  {!selectedRequest.commitment_fee_paid ? (
                    <Link
                      href={`/customer/payments/transfer/procurement/${encodeURIComponent(selectedRequest.reference_number)}`}
                      className="portal-home__btn portal-home__btn--primary"
                      style={{ marginTop: "8px", fontSize: "11px", padding: "4px 8px", textAlign: "center", textDecoration: "none" }}
                    >
                      Upload Transfer Receipt
                    </Link>
                  ) : (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", marginTop: "6px" }}>Paid</span>
                  )}
                </div>

                {selectedRequest.quote_total ? (
                  <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--color-dheir-surface)", border: "1px solid var(--color-dheir-border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)" }}>Quotation Total</span>
                      <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: 700, color: "var(--color-dheir-blue)" }}>
                        ₦{Number(selectedRequest.quote_total).toLocaleString()}
                      </p>
                    </div>
                    {selectedRequest.status === "quoted" ? (
                      <Link
                        href={`/customer/payments/transfer/procurement/${encodeURIComponent(selectedRequest.reference_number)}?type=quote`}
                        className="portal-home__btn portal-home__btn--primary"
                        style={{ marginTop: "8px", fontSize: "11px", padding: "4px 8px", textAlign: "center", textDecoration: "none" }}
                      >
                        Pay Quote via Transfer
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Product link if procurement */}
              {selectedRequest.product_url && (
                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--color-dheir-surface)", border: "1px solid var(--color-dheir-border)" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-dheir-muted)", textTransform: "uppercase" }}>
                    Source URL:
                  </span>
                  <a
                    href={selectedRequest.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", marginTop: "4px", fontSize: "13px", color: "var(--color-dheir-blue)", wordBreak: "break-all" }}
                  >
                    {selectedRequest.product_url}
                  </a>
                </div>
              )}

              {/* Chat Thread */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-dheir-ink)", marginBottom: "12px" }}>
                  Procurement Communication Thread
                </h4>

                <div
                  style={{
                    minHeight: "180px",
                    maxHeight: "260px",
                    overflowY: "auto",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--color-dheir-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {loadingChat ? (
                    <div style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
                      <DHEIRLoader size={8} color="var(--color-dheir-blue)" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "var(--color-dheir-muted)", textAlign: "center", margin: "auto 0" }}>
                      No messages yet. Send an update or question below.
                    </p>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_role === "customer"
                      return (
                        <div
                          key={m.id}
                          style={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            maxWidth: "80%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            backgroundColor: isMe ? "var(--color-dheir-blue)" : "#ffffff",
                            color: isMe ? "#ffffff" : "var(--color-dheir-ink)",
                            border: isMe ? "none" : "1px solid var(--color-dheir-border)",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ display: "block", fontSize: "10px", opacity: 0.8, marginBottom: "2px", fontWeight: 600 }}>
                            {isMe ? "You" : "DHEIR China Agent"} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <p style={{ margin: 0 }}>{m.message}</p>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={sendMessage} style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <input
                    type="text"
                    required
                    placeholder="Type message to procurement officer..."
                    className="dheir-input"
                    style={{ minHeight: "42px" }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="portal-home__btn portal-home__btn--primary"
                    style={{ padding: "0 18px", height: "42px" }}
                  >
                    <IconSend size={16} stroke={1.5} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
