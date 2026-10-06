"use client"

import { useEffect } from "react"
import { IconAlertTriangle, IconCopy, IconPlaneDeparture, IconX } from "@tabler/icons-react"

type PortalAirWarehouseNoticeModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  copyTargetLabel?: string
}

export function PortalAirWarehouseNoticeModal({
  isOpen,
  onClose,
  onConfirm,
  copyTargetLabel = "Air warehouse address",
}: PortalAirWarehouseNoticeModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="portal-request-mail__dialog-backdrop"
      style={{
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="portal-request-mail__dialog"
        style={{
          width: "min(460px, 100%)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="air-notice-title"
      >
        <div className="portal-request-mail__dialog-head" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#d97706",
                flexShrink: 0,
              }}
            >
              <IconPlaneDeparture size={20} stroke={2} />
            </span>
            <h2
              id="air-notice-title"
              className="portal-request-mail__dialog-title"
              style={{ fontSize: "16px", fontWeight: 700 }}
            >
              Air Shipping Notice
            </h2>
          </div>
          <button
            type="button"
            className="portal-request-mail__dialog-close"
            onClick={onClose}
            aria-label="Close"
          >
            <IconX size={18} stroke={1.5} />
          </button>
        </div>

        <div className="portal-request-mail__dialog-body" style={{ padding: "20px" }}>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
              <IconAlertTriangle size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#78350f" }}>
                Important: Before you copy this address
              </p>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: "13px", lineHeight: "1.5" }}>
              However, you need to know that:
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "13px", lineHeight: "1.6" }}>
              <li style={{ marginBottom: 6 }}>
                The minimum we accept for air is <strong>1kg</strong>.
              </li>
              <li>
                Air shipping is <strong>prepaid</strong>, which means you pay the shipping fee before we ship out the goods.
              </li>
            </ul>
          </div>

          <p style={{ margin: 0, fontSize: "12px", color: "var(--color-dheir-muted)", lineHeight: "1.5" }}>
            Please confirm you understand these terms before sending your supplier this Air warehouse address.
          </p>
        </div>

        <div
          className="portal-request-mail__dialog-actions"
          style={{
            padding: "14px 20px",
            background: "var(--color-dheir-page)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 16px",
              borderRadius: "10px",
              border: "1px solid var(--color-dheir-border)",
              background: "var(--color-dheir-surface)",
              color: "var(--color-dheir-muted)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              borderRadius: "10px",
              border: "none",
              background: "var(--color-dheir-blue)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0, 82, 255, 0.25)",
            }}
          >
            <IconCopy size={16} stroke={1.5} />
            <span>I Understand & Copy</span>
          </button>
        </div>
      </div>
    </div>
  )
}
