"use client"

import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"

const POPUP_DISMISSED_KEY = "dheir_logistics_policy_dismissed_at"
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

type LogisticsPolicyModalProps = {
  memberCode?: string
}

export function LogisticsPolicyModal({ memberCode }: LogisticsPolicyModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const storageKey = memberCode ? `${POPUP_DISMISSED_KEY}_${memberCode}` : POPUP_DISMISSED_KEY
      const dismissedAtStr = localStorage.getItem(storageKey)

      if (dismissedAtStr) {
        const dismissedAt = parseInt(dismissedAtStr, 10)
        const now = Date.now()
        if (now - dismissedAt < TWENTY_FOUR_HOURS_MS) {
          return
        }
      }

      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 500)

      return () => clearTimeout(timer)
    } catch {
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
        }}
      >
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
              backgroundColor: "rgba(255, 255, 255, 0.14)",
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
              color: "#93c5fd",
            }}
          >
            IMPORTANT NOTICE
          </p>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
            LOGISTICS &amp; SHIPPING POLICY
          </h2>
        </div>

        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            maxHeight: "72vh",
            overflowY: "auto",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
            Kindly take note of these shipping guidelines before sending parcels to our Guangzhou warehouse:
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
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
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>MINIMUM AIR SHIPPING WEIGHT IS 1 KG</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Any parcel weighing below 1 KG is billed at the 1 KG rate, and both Air and Express Cargo are strictly prepaid before dispatch.
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
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>WRITE YOUR FULL SHIPPING MARK ON EVERY PARCEL</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Suppliers must label every carton with your exact Member Code
                  {memberCode ? ` (${memberCode})` : ""} and Nigerian phone number so items are matched to your account immediately.
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
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>PRE-ADD YOUR SUPPLIER TRACKING NUMBERS</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Submit tracking numbers via Add Package before delivery to speed up warehouse check-in and inspection.
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
              }}
            >
              <span style={{ color: "#2563eb", marginTop: "2px", flexShrink: 0 }}>
                <IconCheck size={16} stroke={2.5} />
              </span>
              <span>
                <strong>TRANSIT &amp; STORAGE TERMS</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Air cargo averages 5 to 10 working days and Sea cargo 45 to 60 days from loading date, subject to airline or customs clearance.
                </span>
              </span>
            </li>
          </ul>

          <div
            style={{
              backgroundColor: "#fff7ed",
              borderRadius: "10px",
              padding: "12px 14px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            <IconAlertCircle size={18} stroke={2} style={{ color: "#c2410c", marginTop: "2px", flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "12px", color: "#9a3412", lineHeight: 1.45, fontWeight: 600 }}>
              <strong>NOTE:</strong> All freight invoices must be cleared before cargo release, and overdue unclaimed goods may incur storage or demurrage charges.
            </p>
          </div>

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
            }}
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  )
}
