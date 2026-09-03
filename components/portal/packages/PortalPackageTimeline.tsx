"use client"

import { useState } from "react"
import { IconChevronDown, IconCircleCheck, IconCircleDot, IconClock } from "@tabler/icons-react"

type TimelineStep = {
  label: string
  description?: string
  date?: string
  status: "completed" | "current" | "pending"
}

type PortalPackageTimelineProps = {
  packag: {
    status: string
    created_at: string
    stored_at?: string
    received_at?: string
    warehouse_name?: string
  }
  defaultOpen?: boolean
}

export function PortalPackageTimeline({ packag, defaultOpen = true }: PortalPackageTimelineProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  const isStored = ["stored", "requested_for", "assigned_to_shipment", "delivered"].includes(packag.status)
  const isRequested = ["requested_for", "assigned_to_shipment", "delivered"].includes(packag.status)
  const isShipped = ["assigned_to_shipment", "delivered"].includes(packag.status)
  const isDelivered = packag.status === "delivered"

  const steps: TimelineStep[] = [
    {
      label: "Package registered",
      description: "Supplier tracking details added by customer",
      date: packag.created_at,
      status: isStored ? "completed" : "current",
    },
    {
      label: "Arrived at warehouse",
      description: packag.warehouse_name ? `Received at ${packag.warehouse_name}` : "Stored at origin warehouse",
      date: packag.stored_at || packag.received_at,
      status: isStored ? (isRequested ? "completed" : "current") : "pending",
    },
    {
      label: "Release requested",
      description: "Consolidation complete & shipment registered",
      status: isRequested ? (isShipped ? "completed" : "current") : "pending",
    },
    {
      label: "Outbound shipment active",
      description: "Dispatched & in transit to destination",
      status: isShipped ? (isDelivered ? "completed" : "current") : "pending",
    },
    {
      label: "Delivered",
      description: "Package signed & verified",
      status: isDelivered ? "completed" : "pending",
    },
  ]

  return (
    <div style={{ padding: "4px 0" }}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          background: "var(--color-dheir-page)",
          border: "none",
          padding: "8px 12px",
          borderRadius: "8px",
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
          userSelect: "none",
          marginBottom: isOpen ? 12 : 0,
          transition: "background-color 150ms ease",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-dheir-ink)", letterSpacing: "0.05em" }}>
          Delivery Progress
        </span>
        <IconChevronDown
          size={16}
          style={{
            color: "var(--color-dheir-ink)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease-in-out",
            pointerEvents: "none",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            paddingLeft: 4,
            paddingTop: 4,
          }}
        >
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1
            const isActive = step.status === "completed" || step.status === "current"

            return (
              <div key={idx} style={{ display: "flex", gap: 16, position: "relative" }}>
                {/* Connector line */}
                {!isLast && (
                  <div
                    style={{
                      position: "absolute",
                      left: 9,
                      top: 20,
                      bottom: -8,
                      width: 2,
                      borderLeft: step.status === "completed" 
                        ? "2px solid var(--color-dheir-blue)" 
                        : "2px dashed var(--color-dheir-border)",
                    }}
                  />
                )}

                {/* Step indicator circle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                  {step.status === "completed" ? (
                    <IconCircleCheck size={20} stroke={2} style={{ color: "var(--color-dheir-blue)", background: "var(--color-dheir-surface)", borderRadius: "50%" }} />
                  ) : step.status === "current" ? (
                    <IconCircleDot size={20} stroke={2} style={{ color: "var(--color-dheir-blue)", background: "var(--color-dheir-surface)", borderRadius: "50%" }} />
                  ) : (
                    <IconClock size={20} stroke={1.5} style={{ color: "var(--color-dheir-muted)", background: "var(--color-dheir-surface)", borderRadius: "50%" }} />
                  )}
                </div>

                {/* Step text */}
                <div style={{ paddingBottom: 16, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: 600,
                        color: isActive ? "var(--color-dheir-ink)" : "var(--color-dheir-muted)",
                      }}
                    >
                      {step.label}
                    </h4>
                    {step.date && (
                      <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)", whiteSpace: "nowrap" }}>
                        {new Date(step.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-dheir-muted)" }}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
