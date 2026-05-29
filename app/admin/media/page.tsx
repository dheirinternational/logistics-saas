"use client"

import { AdminMediaVideoLightbox } from "@/components/admin/media/AdminMediaVideoLightbox"
import { AdminMediaVideoPlayButton } from "@/components/admin/media/AdminMediaVideoPlayButton"
import { MediaDeleteConfirmModal } from "@/components/admin/media/MediaDeleteConfirmModal"
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import { IconPhoto, IconPlayerPlay, IconUpload, IconVideo } from "@tabler/icons-react"
import { MediaVaultThumbnail } from "@/components/admin/media/MediaVaultThumbnail"
import { NextPage } from "next"
import { useCallback, useEffect, useMemo, useState } from "react"

type MediaType = "photo" | "video"

type MediaItem = {
  id: number
  name: string
  path: string
  publicUrl: string
  mediaType: MediaType
  sizeBytes: number
  updatedAt: string | null
}

function formatMediaSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const Page: NextPage = () => {
  const [allMedia, setAllMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fullscreenVideoSrc, setFullscreenVideoSrc] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const loadMedia = useCallback(async (opts?: { silent?: boolean; sync?: boolean }) => {
    if (opts?.silent || opts?.sync) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const params = opts?.sync ? "?sync=1" : ""
      const res = await fetch(`/api/admin/media${params}`, { credentials: "include" })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message ?? "Could not load media")
        return
      }
      setAllMedia(result.data ?? [])
      if (opts?.sync) {
        const imported = Number(result.sync?.imported ?? 0)
        const pruned = Number(result.sync?.pruned ?? 0)
        if (imported > 0 || pruned > 0) {
          toast.success(
            imported > 0
              ? `Imported ${imported} file(s) from storage and existing records.`
              : `Cleaned up ${pruned} invalid catalog row(s).`
          )
        } else {
          toast.success("Library is up to date.")
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Could not load media")
    } finally {
      setLoading(false)
      setRefreshing(false)
      setImporting(false)
    }
  }, [])

  const handleImportExisting = async () => {
    setImporting(true)
    await loadMedia({ sync: true })
  }

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  const photos = useMemo(
    () => allMedia.filter((item) => item.mediaType === "photo"),
    [allMedia]
  )
  const videos = useMemo(
    () => allMedia.filter((item) => item.mediaType === "video"),
    [allMedia]
  )

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id, path: deleteTarget.path }),
        credentials: "include",
      })
      const result = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(result.message ?? "Delete failed")
        return
      }

      toast.success(result.message ?? "Deleted")
      setDeleteTarget(null)
      await loadMedia({ silent: true })
    } catch (err) {
      console.error(err)
      toast.error("Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="portal-home media-vault-page">
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Admin</p>
          <h1 className="portal-home__greeting-title">Media</h1>
          <p className="portal-home__greeting-sub">
            Uploads are saved to your library immediately. Use import once to pull in older
            files from packages, products, and shipments storage.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <button
            type="button"
            className="portal-home__btn portal-home__btn--secondary"
            onClick={handleImportExisting}
            disabled={importing || uploadBusy}
          >
            {importing ? "Importing…" : "Import existing files"}
          </button>
          <button
            type="button"
            className="portal-home__btn portal-home__btn--primary"
            onClick={() => setUploadOpen(true)}
            disabled={uploadBusy}
          >
            <IconUpload size={16} stroke={1.8} />
            Upload media
          </button>
        </div>
      </header>

      <div className="portal-home__stats" role="list" aria-label="Media stats">
        <div className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconPhoto size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Photos</span>
            <span className="portal-home__stat-card-value">{photos.length}</span>
            <span className="portal-home__stat-card-hint">Image files</span>
          </span>
        </div>

        <div className="portal-home__stat-card" role="listitem">
          <span className="portal-home__stat-card-icon" aria-hidden>
            <IconVideo size={22} stroke={1.5} />
          </span>
          <span className="portal-home__stat-card-body">
            <span className="portal-home__stat-card-label">Videos</span>
            <span className="portal-home__stat-card-value">{videos.length}</span>
            <span className="portal-home__stat-card-hint">Video files</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="portal-home__panel portal-home__loader">
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : (
        <>
          <section className="portal-home__panel" aria-labelledby="media-photos-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="media-photos-heading" className="portal-home__section-title">
                  Photos
                </h2>
                <p className="portal-home__section-sub">Uploaded image media.</p>
              </div>
              {refreshing ? (
                <span className="media-vault-refreshing">
                  <DheirLoader color="var(--color-dheir-blue)" size={9} />
                  Updating...
                </span>
              ) : null}
            </div>
            {photos.length < 1 ? (
              <div className="portal-home__panel-empty">No photos uploaded yet.</div>
            ) : (
              <div className="media-vault-grid">
                {photos.map((item) => (
                  <article key={item.id || item.path} className="media-vault-card">
                    <div className="media-vault-card__preview media-vault-card__preview--image">
                      <MediaVaultThumbnail src={item.publicUrl} alt={item.name} />
                    </div>
                    <div className="media-vault-card__meta">
                      <p title={item.name}>{item.name}</p>
                      <span>{formatMediaSize(item.sizeBytes)}</span>
                    </div>
                    <button
                      type="button"
                      className="portal-home__btn media-vault-danger-btn media-vault-card__delete"
                      onClick={() => setDeleteTarget(item)}
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="portal-home__panel" aria-labelledby="media-videos-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="media-videos-heading" className="portal-home__section-title">
                  Videos
                </h2>
                <p className="portal-home__section-sub">Uploaded video media.</p>
              </div>
            </div>
            {videos.length < 1 ? (
              <div className="portal-home__panel-empty">No videos uploaded yet.</div>
            ) : (
              <div className="media-vault-grid">
                {videos.map((item) => (
                  <article key={item.id || item.path} className="media-vault-card">
                    <div className="media-vault-card__preview media-vault-card__preview--video">
                      <video src={item.publicUrl} preload="metadata" muted playsInline />
                      <AdminMediaVideoPlayButton
                        onPlay={() => setFullscreenVideoSrc(item.publicUrl)}
                        ariaLabel={`Play ${item.name}`}
                      />
                      <span className="media-vault-card__video-chip">
                        <IconPlayerPlay size={14} stroke={1.8} />
                        Video
                      </span>
                    </div>
                    <div className="media-vault-card__meta">
                      <p title={item.name}>{item.name}</p>
                      <span>{formatMediaSize(item.sizeBytes)}</span>
                    </div>
                    <button
                      type="button"
                      className="portal-home__btn media-vault-danger-btn media-vault-card__delete"
                      onClick={() => setDeleteTarget(item)}
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onFinished={async () => {
          setUploadBusy(true)
          try {
            await loadMedia({ silent: true })
          } finally {
            setUploadBusy(false)
          }
        }}
      />

      <MediaDeleteConfirmModal
        open={Boolean(deleteTarget)}
        mediaName={deleteTarget?.name ?? null}
        deleting={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />

      {fullscreenVideoSrc ? (
        <AdminMediaVideoLightbox
          src={fullscreenVideoSrc}
          onClose={() => setFullscreenVideoSrc(null)}
        />
      ) : null}
    </div>
  )
}

export default Page
