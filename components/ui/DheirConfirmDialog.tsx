"use client"

import { DheirLoader } from "@/components/ui/DheirLoader"
import { IconX } from "@tabler/icons-react"
import { useEffect, type MouseEvent, type ReactNode } from "react"

export type DheirConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "danger"
  loading?: boolean
}

export function DheirConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: DheirConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose()
    }
    document.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [open, loading, onClose])

  if (!open) return null

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose()
  }

  return (
    <div
      className="dheir-dialog-backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className="dheir-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dheir-dialog-title"
        aria-describedby={description ? "dheir-dialog-desc" : undefined}
      >
        <div className="dheir-dialog__head">
          <h2 id="dheir-dialog-title" className="dheir-dialog__title">
            {title}
          </h2>
          <button
            type="button"
            className="dheir-dialog__close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        {description ? (
          <div id="dheir-dialog-desc" className="dheir-dialog__body">
            {typeof description === "string" ? (
              <p className="dheir-dialog__text">{description}</p>
            ) : (
              description
            )}
          </div>
        ) : null}

        <div className="dheir-dialog__actions">
          <button
            type="button"
            className="dheir-dialog__btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`dheir-dialog__btn-primary${variant === "danger" ? " dheir-dialog__btn-primary--danger" : ""}`}
            onClick={() => void onConfirm()}
            disabled={loading}
          >
            {loading ? <DheirLoader size="sm" variant="white" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
