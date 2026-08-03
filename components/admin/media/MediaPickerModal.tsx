"use client"

import { AdminMediaVideoLightbox } from "@/components/admin/media/AdminMediaVideoLightbox"
import { AdminMediaVideoPlayButton } from "@/components/admin/media/AdminMediaVideoPlayButton"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { apiErrorMessage, parseJsonResponse } from "@/lib/api/parseJsonResponse"
import type { AdminMediaItem } from "@/lib/media/adminMedia"
import { toast } from "@/lib/ui/toast"
import { IconPhoto, IconPlayerPlay, IconX } from "@tabler/icons-react"
import { MediaVaultThumbnail } from "@/components/admin/media/MediaVaultThumbnail"
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"

type Props = {
  open: boolean
  title?: string
  maxCount: number
  minCount?: number
  initialSelected?: AdminMediaItem[]
  onClose: () => void
  onConfirm: (items: AdminMediaItem[]) => void
}

const EMPTY_SELECTED: AdminMediaItem[] = []

function formatMediaSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaPickerModal({
  open,
  title = "Choose from media library",
  maxCount,
  minCount = 1,
  initialSelected,
  onClose,
  onConfirm,
}: Props) {
  const [allMedia, setAllMedia] = useState<AdminMediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<AdminMediaItem[]>([])
  const [tab, setTab] = useState<"all" | "photo" | "video">("all")
  const [fullscreenVideoSrc, setFullscreenVideoSrc] = useState<string | null>(null)

  const wasOpenRef = useRef(false)
  const loadAbortRef = useRef<AbortController | null>(null)
  const loadFailedRef = useRef(false)

  const loadMedia = useCallback(async (signal: AbortSignal) => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/media", { credentials: "include", signal })
      const result = await parseJsonResponse(res)
      if (!res.ok) {
        if (!loadFailedRef.current) {
          loadFailedRef.current = true
          toast.error(apiErrorMessage(result, "Could not load media library"))
        }
        return
      }
      setAllMedia((result.data as AdminMediaItem[]) ?? [])
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return
      if (!loadFailedRef.current) {
        loadFailedRef.current = true
        const message = err instanceof Error ? err.message : "Could not load media library"
        toast.error(message)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false
      loadAbortRef.current?.abort()
      loadAbortRef.current = null
      return
    }

    if (wasOpenRef.current) return
    wasOpenRef.current = true
    loadFailedRef.current = false

    setSelected(initialSelected ?? EMPTY_SELECTED)
    setTab("all")

    loadAbortRef.current?.abort()
    const ac = new AbortController()
    loadAbortRef.current = ac
    void loadMedia(ac.signal)

    return () => {
      ac.abort()
    }
  }, [open, initialSelected, loadMedia])

  const filtered = useMemo(() => {
    if (tab === "photo") return allMedia.filter((m) => m.mediaType === "photo")
    if (tab === "video") return allMedia.filter((m) => m.mediaType === "video")
    return allMedia
  }, [allMedia, tab])

  const toggle = (item: AdminMediaItem) => {
    const key = item.id > 0 ? String(item.id) : item.path
    const exists = selected.some((s) => (s.id > 0 ? String(s.id) : s.path) === key)
    if (exists) {
      setSelected((prev) =>
        prev.filter((s) => (s.id > 0 ? String(s.id) : s.path) !== key)
      )
      return
    }
    if (selected.length >= maxCount) {
      toast.error(`You can select up to ${maxCount} item(s)`)
      return
    }
    setSelected((prev) => [...prev, item])
  }

  const isSelected = (item: AdminMediaItem) => {
    const key = item.id > 0 ? String(item.id) : item.path
    return selected.some((s) => (s.id > 0 ? String(s.id) : s.path) === key)
  }

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, item: AdminMediaItem) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggle(item)
    }
  }

  const handleConfirm = () => {
    if (selected.length < minCount) {
      toast.error(`Select at least ${minCount} item(s) from the library`)
      return
    }
    onConfirm(selected)
    onClose()
  }

  if (!open) return null

  return (
    <div className="media-vault-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="media-vault-modal media-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="media-vault-modal__close" onClick={onClose} aria-label="Close">
          <IconX size={20} />
        </button>

        <h2 id="media-picker-title" className="media-vault-modal__title">
          {title}
        </h2>
        <p className="media-vault-modal__sub">
          Select up to {maxCount} file(s). Upload new media on the Media page first.
        </p>

        <div className="media-picker-tabs">
          <button
            type="button"
            className={tab === "all" ? "is-active" : ""}
            onClick={() => setTab("all")}
          >
            All ({allMedia.length})
          </button>
          <button
            type="button"
            className={tab === "photo" ? "is-active" : ""}
            onClick={() => setTab("photo")}
          >
            <IconPhoto size={16} /> Photos
          </button>
          <button
            type="button"
            className={tab === "video" ? "is-active" : ""}
            onClick={() => setTab("video")}
          >
            <IconPlayerPlay size={16} /> Videos
          </button>
        </div>

        <p className="media-picker-selection">
          {selected.length} of {maxCount} selected
        </p>

        {loading ? (
          <div className="media-picker-loading">
            <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="media-vault-modal__sub">No media in the library yet. Upload files on Admin → Media.</p>
        ) : (
          <div className="media-vault-grid media-picker-grid">
            {filtered.map((item) => {
              const picked = isSelected(item)
              return (
                <div
                  key={item.id > 0 ? item.id : item.path}
                  role="button"
                  tabIndex={0}
                  className={`media-vault-card media-picker-card${picked ? " is-selected" : ""}`}
                  onClick={() => toggle(item)}
                  onKeyDown={(e) => handleCardKeyDown(e, item)}
                  aria-pressed={picked}
                  aria-label={`${picked ? "Deselect" : "Select"} ${item.name}`}
                >
                  <div className="media-vault-card__preview">
                    {item.mediaType === "video" ? (
                      <>
                        <video src={item.publicUrl} muted playsInline preload="metadata" />
                        <AdminMediaVideoPlayButton
                          onPlay={() => setFullscreenVideoSrc(item.publicUrl)}
                          ariaLabel={`Play ${item.name}`}
                        />
                        <span className="media-vault-card__video-chip">
                          <IconPlayerPlay size={14} />
                        </span>
                      </>
                    ) : (
                      <MediaVaultThumbnail src={item.publicUrl} alt={item.name} />
                    )}
                  </div>
                  <div className="media-vault-card__meta">
                    <p>{item.name}</p>
                    <span>{formatMediaSize(item.sizeBytes)}</span>
                  </div>
                  {picked ? <span className="media-picker-check">Selected</span> : null}
                </div>
              )
            })}
          </div>
        )}

        <div className="media-vault-modal__actions">
          <button type="button" className="portal-home__btn portal-home__btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="portal-home__btn portal-home__btn--primary" onClick={handleConfirm}>
            Use selected ({selected.length})
          </button>
        </div>
      </div>

      {fullscreenVideoSrc ? (
        <AdminMediaVideoLightbox
          src={fullscreenVideoSrc}
          onClose={() => setFullscreenVideoSrc(null)}
        />
      ) : null}
    </div>
  )
}
