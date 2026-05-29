"use client"

import { IconX } from "@tabler/icons-react"

type Props = {
  src: string
  label?: string
  onClose: () => void
}

export function AdminMediaVideoLightbox({ src, label = "Video preview", onClose }: Props) {
  return (
    <div
      className="dheir-dialog-backdrop admin-media-lightbox"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-media-lightbox__panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="dheir-dialog__close admin-media-lightbox__close"
          onClick={onClose}
          aria-label="Close video"
        >
          <IconX size={22} stroke={1.5} />
        </button>
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="admin-media-lightbox__video"
        />
      </div>
    </div>
  )
}
