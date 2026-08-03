"use client"

import {
  dismissToast,
  subscribeToasts,
  type DHEIRToastItem,
  type DHEIRToastType,
} from "@/lib/ui/toast"
import {
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"

const ICONS: Record<DHEIRToastType, typeof IconCircleCheck> = {
  success: IconCircleCheck,
  error: IconAlertCircle,
  info: IconInfoCircle,
}

const LABELS: Record<DHEIRToastType, string> = {
  success: "Success",
  error: "Error",
  info: "Notice",
}

export function DHEIRToastProvider() {
  const [items, setItems] = useState<DHEIRToastItem[]>([])

  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null

  return (
    <div
      className="dheir-toast-viewport"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {items.map((item) => {
        const Icon = ICONS[item.type]
        return (
          <div
            key={item.id}
            className={`dheir-toast dheir-toast--${item.type}${item.exiting ? " is-exiting" : ""}`}
            role="status"
          >
            <span className="dheir-toast__icon" aria-hidden>
              <Icon size={20} stroke={1.75} />
            </span>
            <div className="dheir-toast__body">
              <p className="dheir-toast__label">{LABELS[item.type]}</p>
              <p className="dheir-toast__message">{item.message}</p>
            </div>
            <button
              type="button"
              className="dheir-toast__close"
              onClick={() => dismissToast(item.id)}
              aria-label="Dismiss notification"
            >
              <IconX size={16} stroke={1.5} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
