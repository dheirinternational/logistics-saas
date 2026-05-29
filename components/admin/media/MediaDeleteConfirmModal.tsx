"use client"

import { IconAlertTriangle, IconTrash, IconX } from "@tabler/icons-react"

type MediaDeleteConfirmModalProps = {
  open: boolean
  mediaName: string | null
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function MediaDeleteConfirmModal({
  open,
  mediaName,
  deleting,
  onCancel,
  onConfirm,
}: MediaDeleteConfirmModalProps) {
  if (!open) return null

  return (
    <div className="media-vault-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="media-vault-modal media-vault-modal--danger"
        role="dialog"
        aria-modal="true"
        aria-label="Confirm media delete"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="media-vault-modal__close"
          aria-label="Close confirmation"
          onClick={onCancel}
          disabled={deleting}
        >
          <IconX size={20} stroke={1.7} />
        </button>

        <div className="media-vault-danger-icon" aria-hidden>
          <IconAlertTriangle size={28} stroke={1.6} />
        </div>
        <h2 className="media-vault-modal__title">Delete media?</h2>
        <p className="media-vault-modal__sub">
          This cannot be undone.
          <br />
          <strong>{mediaName ?? "Selected file"}</strong>
        </p>

        <div className="media-vault-modal__actions">
          <button
            type="button"
            className="portal-home__btn portal-home__btn--secondary"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="portal-home__btn media-vault-danger-btn"
            onClick={onConfirm}
            disabled={deleting}
          >
            <IconTrash size={16} stroke={1.8} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
