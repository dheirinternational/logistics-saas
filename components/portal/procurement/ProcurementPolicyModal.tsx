"use client"

import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"

const POPUP_DISMISSED_KEY = "dheir_procurement_policy_dismissed_at"
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

type ProcurementPolicyModalProps = {
  memberCode?: string
}

export function ProcurementPolicyModal({ memberCode }: ProcurementPolicyModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const storageKey = memberCode ? `${POPUP_DISMISSED_KEY}_${memberCode}` : POPUP_DISMISSED_KEY
      const dismissedAtStr = localStorage.getItem(storageKey)

      if (dismissedAtStr) {
        const dismissedAt = parseInt(dismissedAtStr, 10)
        const now = Date.now()
        if (now - dismissedAt < TWENTY_FOUR_HOURS_MS) {
          // Dismissed within last 24 hours
          return
        }
      }

      // Show popup after slight delay for visual smoothness
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 600)

      return () => clearTimeout(timer)
    } catch {
      // If localStorage is unavailable, default to showing
      setIsOpen(true)
    }
  }, [memberCode])

  const handleClose = () => {
    setIsOpen(false)
    try {
      const storageKey = memberCode ? `${POPUP_DISMISSED_KEY}_${memberCode}` : POPUP_DISMISSED_KEY
      localStorage.setItem(storageKey, Date.now().toString())
    } catch {
      // Ignore storage write errors
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
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

          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#38bdf8",
              marginBottom: "4px",
            }}
          >
            Important Notice
          </span>

          <h3
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#ffffff",
            }}
          >
            PROCUREMENT &amp; SOURCING POLICY
          </h3>
        </div>

        {/* Scrollable Modal Content */}
        <div
          style={{
            padding: "20px 24px 24px",
            maxHeight: "75vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "var(--color-dheir-ink, #334155)",
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Kindly take note of the following before we send your quotation and begin sourcing and procuring:
          </p>

          {/* Bullet Points */}
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <li
              style={{
                display: "flex",
                gap: "10px",
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#1e293b",
                backgroundColor: "#f8fafc",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>A COMMITMENT FEE OF ₦20,000 IS PAID BEFORE QUOTATION IS DROPPED FOR SOURCING OR PROCURING</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  (Commitment Fee will be deducted from the Procurement Fee when paid)
                </span>
              </span>
            </li>

            <li
              style={{
                display: "flex",
                gap: "10px",
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#1e293b",
                backgroundColor: "#f8fafc",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>PROCUREMENT FEE IS 10% OF THE TOTAL COST</strong>
              </span>
            </li>

            <li
              style={{
                display: "flex",
                gap: "10px",
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#1e293b",
                backgroundColor: "#f8fafc",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>TRACKING NUMBERS ARE SENT ACCORDING TO THE LINKS NUMBER AND WHEN READY</strong>
              </span>
            </li>

            <li
              style={{
                display: "flex",
                gap: "10px",
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#1e293b",
                backgroundColor: "#f8fafc",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>SOURCING AND PROCUREMENT IS 15% OF THE TOTAL COST</strong>
              </span>
            </li>

            <li
              style={{
                display: "flex",
                gap: "10px",
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#1e293b",
                backgroundColor: "#f8fafc",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>SOURCING FEE IS 7% OF THE ITEM COST</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  (The best links will be dropped for you after payment)
                </span>
              </span>
            </li>
          </ul>

          {/* Note Box */}
          <div
            style={{
              backgroundColor: "#fff7ed",
              border: "1px solid #ffedd5",
              borderRadius: "10px",
              padding: "12px 14px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            <IconAlertCircle size={18} stroke={2} style={{ color: "#c2410c", marginTop: "2px", flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "12px", color: "#9a3412", lineHeight: 1.45, fontWeight: 600 }}>
              <strong>NOTE:</strong> Commitment fee is non-refundable after 72 hours of sourcing or procurement submission.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleClose}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              backgroundColor: "var(--color-dheir-blue, #1a5fff)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "opacity 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  )
}
