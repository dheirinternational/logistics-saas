"use client"

import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import Image from "next/image"

type MediaItem = {
  imageUrl: string
  mediaType: string
}

type PortalMediaGalleryModalProps = {
  isOpen: boolean
  onClose: () => void
  images: MediaItem[]
  initialIndex?: number
}

export function PortalMediaGalleryModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: PortalMediaGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  useEffect(() => {
    if (!isOpen) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }
    document.addEventListener("keydown", onEscape)
    return () => document.removeEventListener("keydown", onEscape)
  }, [isOpen, currentIndex, images])

  if (!isOpen || !images || images.length === 0) return null

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const active = images[currentIndex]

  return (
    <div
      className="dheir-dialog-backdrop"
      style={{ zIndex: 100 }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="dheir-dialog"
        style={{
          maxWidth: "min(90vw, 800px)",
          width: "100%",
          padding: 0,
          background: "#000",
          border: "1px solid #222",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          aspectRatio: "4/3",
          maxHeight: "80vh",
          borderRadius: 16,
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            background: "rgba(0,0,0,0.5)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <IconX size={20} />
        </button>

        {/* Media Container */}
        <div
          style={{
            flex: 1,
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {active.mediaType === "video" ? (
            <video
              src={active.imageUrl}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              controls
              autoPlay
            />
          ) : (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                src={active.imageUrl}
                alt={`Media ${currentIndex + 1}`}
                fill
                style={{ objectFit: "contain" }}
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Left Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Previous image"
          >
            <IconChevronLeft size={24} />
          </button>
        )}

        {/* Right Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Next image"
          >
            <IconChevronRight size={24} />
          </button>
        )}

        {/* Slide indicator */}
        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.5)",
              padding: "4px 10px",
              borderRadius: 12,
              color: "#fff",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}
