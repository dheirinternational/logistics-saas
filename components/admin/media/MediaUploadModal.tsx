"use client"

import { DheirLoader } from "@/components/ui/DheirLoader"
import { IconCloudUpload, IconX } from "@tabler/icons-react"

type MediaUploadModalProps = {
  open: boolean
  onClose: () => void
  onSelectFile: (file: File) => void
  uploading: boolean
  uploadingLabel?: string | null
}

export function MediaUploadModal({
  open,
  onClose,
  onSelectFile,
  uploading,
  uploadingLabel,
}: MediaUploadModalProps) {
  if (!open) return null

  return (
    <div
      className="media-vault-modal-backdrop"
      role="presentation"
      onClick={uploading ? undefined : onClose}
    >
      <div
        className="media-vault-modal media-vault-modal--upload"
        role="dialog"
        aria-modal="true"
        aria-label="Upload media"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="media-vault-modal__close"
          aria-label="Close upload modal"
          onClick={onClose}
          disabled={uploading}
        >
          <IconX size={20} stroke={1.7} />
        </button>

        <div className="media-vault-upload-icon-wrap" aria-hidden>
          <IconCloudUpload size={34} stroke={1.5} />
        </div>

        <h2 className="media-vault-modal__title">Upload media</h2>
        <p className="media-vault-modal__sub">
          Choose one photo or video. It uploads directly to storage and updates the page.
        </p>

        <label className={`media-vault-upload-picker${uploading ? " is-busy" : ""}`}>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              onSelectFile(file)
              e.currentTarget.value = ""
            }}
            disabled={uploading}
          />
          <span>{uploading ? "Uploading..." : "Choose one file"}</span>
        </label>

        {uploading ? (
          <div className="media-vault-upload-state" role="status" aria-live="polite">
            <div className="media-vault-upload-bars" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <p className="media-vault-upload-state__label">
              <DheirLoader color="var(--color-dheir-blue)" size={9} />
              {uploadingLabel ?? "Uploading..."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
