"use client"

import { useState } from "react"
import { IconChevronDown, IconCircleCheck, IconCircleDot, IconClock } from "@tabler/icons-react"

type TimelineEvent = {
  timeLabel: string
  dateLabel: string
  text: string
  isCompleted: boolean
  isSigned?: boolean
}

type PortalShipmentTimelineProps = {
  shipment: {
    status: string
    created_at: string
  }
}

export function PortalShipmentTimeline({ shipment }: PortalShipmentTimelineProps) {
  const [isOpen, setIsOpen] = useState(false)

  const status = shipment.status
  const createdAtStr = shipment.created_at

  const base = new Date(createdAtStr)
  const now = new Date()

  // Status rank
  const statusRank: Record<string, number> = {
    "pending": 0,
    "processing": 1,
    "shipped": 2,
    "in_transit": 3,
    "arrived": 4,
    "out_for_delivery": 5,
    "delivered": 6
  }

  const currentRank = statusRank[status] ?? 0

  const milestones = [
    { offsetMs: 4 * 60 * 60 * 1000, text: "[Shipment departed from warehouse to airport]", minRank: 2 },
    { offsetMs: 9 * 60 * 60 * 1000, text: "[Shipment in transit to international airport]", minRank: 2 },
    { offsetMs: 20 * 60 * 60 * 1000, text: "[Shipment arrived at international airport]", minRank: 3 },
    { offsetMs: 21 * 60 * 60 * 1000, text: "[Shipment departed from international airport]", minRank: 3 },
    { offsetMs: (3 * 24 + 4) * 60 * 60 * 1000, text: "[Goods arrived at Lagos warehouse]", minRank: 4 },
    { offsetMs: (3 * 24 + 5) * 60 * 60 * 1000, text: "[Shipment arrived destination port and under customs process]", minRank: 4 },
    { offsetMs: (3 * 24 + 7) * 60 * 60 * 1000, text: "[Shipment arrived at Nigeria warehouse]", minRank: 5 },
    { offsetMs: (3 * 24 + 9) * 60 * 60 * 1000, text: "Signed", minRank: 6, isSigned: true }
  ]

  const events: TimelineEvent[] = []

  // Add base registration event
  events.push({
    dateLabel: base.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-"),
    timeLabel: base.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    text: "Consolidation complete & shipment registered",
    isCompleted: true
  })

  for (const m of milestones) {
    if (currentRank >= m.minRank) {
      let mTime = new Date(base.getTime() + m.offsetMs)
      if (mTime > now) {
        mTime = new Date(now.getTime() - 10 * 60 * 1000)
      }
      events.push({
        dateLabel: mTime.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-"),
        timeLabel: mTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        text: m.text,
        isCompleted: true,
        isSigned: m.isSigned
      })
    } else {
      events.push({
        dateLabel: "",
        timeLabel: "",
        text: m.text,
        isCompleted: false,
        isSigned: m.isSigned
      })
    }
  }

  return (
    <div style={{ padding: "8px 0 8px 8px" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          background: "none",
          border: "none",
          padding: "4px 0",
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
          marginBottom: isOpen ? 16 : 0,
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-dheir-muted)", letterSpacing: "0.05em" }}>
          Delivery Progress
        </span>
        <IconChevronDown
          size={16}
          style={{
            color: "var(--color-dheir-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 250ms ease-in-out",
          }}
        />
      </button>

      <div
        style={{
          maxHeight: isOpen ? "2000px" : "0px",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 300ms ease-in-out, opacity 250ms ease-in-out",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          paddingTop: isOpen ? 8 : 0
        }}
      >
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1
          const isActive = event.isCompleted

          return (
            <div key={idx} style={{ display: "flex", gap: 16, position: "relative", minHeight: 64 }}>
              {/* Left Column: Date & Time */}
              <div style={{ width: 90, textAlign: "right", display: "flex", flexDirection: "column", gap: 2, paddingRight: 4 }}>
                {isActive && (
                  <>
                    <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)" }}>
                      {event.dateLabel}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-dheir-ink)" }}>
                      {event.timeLabel}
                    </span>
                  </>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    left: 115,
                    top: 18,
                    bottom: -8,
                    width: 2,
                    borderLeft: isActive && events[idx + 1].isCompleted
                      ? "2px solid var(--color-dheir-blue)" 
                      : "2px dashed var(--color-dheir-border)",
                  }}
                />
              )}

              {/* Step indicator circle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                {event.isSigned && isActive ? (
                  <IconCircleCheck size={20} stroke={2} style={{ color: "#22c55e", background: "var(--color-dheir-surface)", borderRadius: "50%" }} />
                ) : isActive ? (
                  <IconCircleDot size={20} stroke={2} style={{ color: "var(--color-dheir-blue)", background: "var(--color-dheir-surface)", borderRadius: "50%" }} />
                ) : (
                  <IconClock size={20} stroke={1.5} style={{ color: "var(--color-dheir-muted)", background: "var(--color-dheir-surface)", borderRadius: "50%" }} />
                )}
              </div>

              {/* Step text */}
              <div style={{ paddingBottom: 16, flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--color-dheir-ink)" : "var(--color-dheir-muted)",
                    lineHeight: "1.4"
                  }}
                >
                  {event.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
