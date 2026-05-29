"use client"

import { useCallback, useState } from "react"

type Props = {
  src: string
  alt: string
  className?: string
}

/**
 * Native img for Supabase public URLs — avoids Next/Image connection bursts
 * and retries once on transient SSL/network failures (common with many parallel loads).
 */
export function MediaVaultThumbnail({ src, alt, className = "object-cover" }: Props) {
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)

  const displaySrc =
    attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`

  const handleError = useCallback(() => {
    if (attempt < 2) {
      setAttempt((n) => n + 1)
      return
    }
    setFailed(true)
  }, [attempt])

  if (failed) {
    return (
      <div className="media-vault-card__thumb-fallback" role="img" aria-label={alt}>
        Preview unavailable
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={displaySrc}
      src={displaySrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={handleError}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  )
}
