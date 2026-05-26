"use client"

import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import { IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"

export type AdminAnnouncement = {
  id: number
  title: string
  message: string
}

type AdminAnnouncementModalProps = {
  open: boolean
  mode: "create" | "edit"
  announcement?: AdminAnnouncement | null
  onClose: () => void
  onSaved: () => void
}

export function AdminAnnouncementModal({
  open,
  mode,
  announcement,
  onClose,
  onSaved,
}: AdminAnnouncementModalProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setSubmitting(false)
    if (mode === "edit" && announcement) {
      setTitle(announcement.title ?? "")
      setMessage(announcement.message ?? "")
    } else {
      setTitle("")
      setMessage("")
    }
  }, [open, mode, announcement])

  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose()
    }
    document.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [open, submitting, onClose])

  if (!open) return null

  const canSubmit =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    (mode === "create" ||
      (announcement &&
        (title.trim() !== announcement.title.trim() ||
          message.trim() !== announcement.message.trim())))

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const url = "/api/announcements"
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:
          mode === "create"
            ? JSON.stringify({ title: title.trim(), message: message.trim() })
            : JSON.stringify({
                id: announcement?.id,
                title: title.trim(),
                message: message.trim(),
              }),
      })

      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message ?? "Something went wrong")
        return
      }

      toast.success(result.message ?? "Saved")
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="dheir-dialog-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <div
        className="dheir-dialog admin-announcement-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-announcement-modal-title"
      >
        <div className="dheir-dialog__head">
          <h2 id="admin-announcement-modal-title" className="dheir-dialog__title">
            {mode === "create" ? "Create announcement" : "Edit announcement"}
          </h2>
          <button
            type="button"
            className="dheir-dialog__close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        <div className="dheir-dialog__body admin-announcement-modal__body">
          <label className="portal-review-modal__field">
            <span className="portal-packages__field-label">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Update on shipment"
              disabled={submitting}
              className="dheir-input"
            />
          </label>

          <label className="portal-review-modal__field">
            <span className="portal-packages__field-label">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the message customers will see…"
              rows={4}
              disabled={submitting}
              className="portal-packages__textarea"
            />
          </label>
        </div>

        <div className="dheir-dialog__actions">
          <button
            type="button"
            className="dheir-dialog__btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dheir-dialog__btn-primary"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || submitting}
          >
            {submitting ? <DheirLoader size="sm" variant="white" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

