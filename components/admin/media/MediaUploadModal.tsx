"use client"

import { DheirLoader } from "@/components/ui/DheirLoader"
import {
  MEDIA_UPLOAD_DELAY_MS,
  MEDIA_UPLOAD_MAX_BATCH,
  sleep,
  uploadAdminMediaFile,
  validateAdminMediaFile,
} from "@/lib/media/uploadAdminMediaFile"
import { MAX_PRODUCT_MEDIA_FILE_LABEL } from "@/lib/products/productMediaLimits"
import { toast } from "@/lib/ui/toast"
import { IconCheck, IconCloudUpload, IconX } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"

type QueueStatus = "pending" | "uploading" | "done" | "error" | "skipped"

type QueueItem = {
  id: string
  file: File
  status: QueueStatus
  message?: string
}

type MediaUploadModalProps = {
  open: boolean
  onClose: () => void
  onFinished: () => void | Promise<void>
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function statusLabel(item: QueueItem) {
  switch (item.status) {
    case "pending":
      return "Waiting"
    case "uploading":
      return "Uploading…"
    case "done":
      return "Done"
    case "error":
      return item.message ?? "Failed"
    case "skipped":
      return item.message ?? "Skipped"
    default:
      return ""
  }
}

export function MediaUploadModal({ open, onClose, onFinished }: MediaUploadModalProps) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [running, setRunning] = useState(false)
  const abortRef = useRef(false)

  useEffect(() => {
    if (!open) {
      abortRef.current = true
      setQueue([])
      setRunning(false)
    } else {
      abortRef.current = false
    }
  }, [open])

  if (!open) return null

  const hasQueue = queue.length > 0
  const doneCount = queue.filter((q) => q.status === "done").length
  const errorCount = queue.filter((q) => q.status === "error").length
  const pendingCount = queue.filter((q) => q.status === "pending").length
  const allFinished = hasQueue && pendingCount === 0 && !running

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList?.length || running) return

    const files = Array.from(fileList)
    if (files.length > MEDIA_UPLOAD_MAX_BATCH) {
      toast.error(`Select up to ${MEDIA_UPLOAD_MAX_BATCH} files at a time.`)
      return
    }

    const next: QueueItem[] = []
    for (const file of files) {
      const validationError = validateAdminMediaFile(file)
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        status: validationError ? "skipped" : "pending",
        message: validationError ?? undefined,
      })
    }

    setQueue(next)
  }

  const removeFromQueue = (id: string) => {
    if (running) return
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  const runSequentialUpload = async () => {
    const toUpload = queue.filter((item) => item.status === "pending")
    if (toUpload.length === 0) {
      toast.info("No valid files waiting to upload")
      return
    }

    setRunning(true)
    abortRef.current = false

    let succeeded = 0
    let failed = 0

    for (let i = 0; i < toUpload.length; i++) {
      if (abortRef.current) break

      const item = toUpload[i]
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" as const } : q)),
      )

      try {
        const result = await uploadAdminMediaFile(item.file)
        if (result.ok) {
          succeeded += 1
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status: "done" as const, message: result.message } : q,
            ),
          )
        } else {
          failed += 1
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status: "error" as const, message: result.message } : q,
            ),
          )
        }
      } catch (err) {
        failed += 1
        const message = err instanceof Error ? err.message : "Upload failed"
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "error" as const, message } : q)),
        )
      }

      const hasMore = i < toUpload.length - 1
      if (hasMore && !abortRef.current) {
        await sleep(MEDIA_UPLOAD_DELAY_MS)
      }
    }

    setRunning(false)

    if (succeeded > 0) {
      await onFinished()
    }

    if (failed === 0 && succeeded > 0) {
      toast.success(
        succeeded === 1 ? "1 file uploaded" : `${succeeded} files uploaded successfully`,
      )
    } else if (succeeded > 0 && failed > 0) {
      toast.info(`${succeeded} uploaded, ${failed} failed. See the list for details.`)
    } else if (failed > 0) {
      toast.error("No files uploaded. Check errors in the list.")
    }
  }

  const handleClose = () => {
    if (running) return
    onClose()
  }

  return (
    <div
      className="media-vault-modal-backdrop"
      role="presentation"
      onClick={running ? undefined : handleClose}
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
          onClick={handleClose}
          disabled={running}
        >
          <IconX size={20} stroke={1.7} />
        </button>

        <div className="media-vault-upload-icon-wrap" aria-hidden>
          <IconCloudUpload size={34} stroke={1.5} />
        </div>

        <h2 className="media-vault-modal__title">Upload media</h2>
        <p className="media-vault-modal__sub">
          Choose multiple photos or videos (max {MAX_PRODUCT_MEDIA_FILE_LABEL} each). Files upload
          one at a time with a short pause between each so the server stays stable.
        </p>

        <label className={`media-vault-upload-picker${running ? " is-busy" : ""}`}>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => {
              handleFilesSelected(e.target.files)
              e.currentTarget.value = ""
            }}
            disabled={running}
          />
          <span>{running ? "Uploading…" : hasQueue ? "Choose different files" : "Choose files"}</span>
        </label>

        {hasQueue ? (
          <div className="media-vault-upload-queue" role="list" aria-label="Upload queue">
            <p className="media-vault-upload-queue__summary">
              {running
                ? `Uploading… ${doneCount + errorCount} of ${queue.filter((q) => q.status !== "skipped").length} processed`
                : `${queue.length} file(s) selected · ${pendingCount} waiting`}
            </p>
            <ul className="media-vault-upload-queue__list">
              {queue.map((item) => (
                <li
                  key={item.id}
                  className={`media-vault-upload-queue__item is-${item.status}`}
                  role="listitem"
                >
                  <div className="media-vault-upload-queue__item-main">
                    <p className="media-vault-upload-queue__name" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <p className="media-vault-upload-queue__meta">
                      {formatBytes(item.file.size)} · {statusLabel(item)}
                    </p>
                  </div>
                  {item.status === "uploading" ? (
                    <DheirLoader color="var(--color-dheir-blue)" size={8} />
                  ) : item.status === "done" ? (
                    <IconCheck size={18} stroke={2} className="media-vault-upload-queue__ok" />
                  ) : !running && item.status === "pending" ? (
                    <button
                      type="button"
                      className="media-vault-upload-queue__remove"
                      onClick={() => removeFromQueue(item.id)}
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <IconX size={16} />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {running ? (
          <div className="media-vault-upload-state" role="status" aria-live="polite">
            <div className="media-vault-upload-bars" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <p className="media-vault-upload-state__label">
              <DheirLoader color="var(--color-dheir-blue)" size={9} />
              Uploading one file at a time… please wait.
            </p>
          </div>
        ) : null}

        <div className="media-vault-modal__actions">
          <button
            type="button"
            className="portal-home__btn portal-home__btn--secondary"
            onClick={handleClose}
            disabled={running}
          >
            {allFinished ? "Close" : "Cancel"}
          </button>
          {hasQueue && pendingCount > 0 ? (
            <button
              type="button"
              className="portal-home__btn portal-home__btn--primary"
              onClick={() => void runSequentialUpload()}
              disabled={running}
            >
              Upload {pendingCount} file{pendingCount === 1 ? "" : "s"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
