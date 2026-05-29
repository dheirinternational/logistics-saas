"use client"

import { IconPhoto, IconPlayerPlay } from "@tabler/icons-react"
import { useCallback, useState } from "react"

const THUMB_SIZE = 44

type Props = {
  imageUrl?: string | null
  mediaType?: "image" | "video" | null
  alt?: string
}

export function ProductCoverThumb({ imageUrl, mediaType, alt = "" }: Props) {
  const [failed, setFailed] = useState(false)

  const handleImgError = useCallback(() => {
    setFailed(true)
  }, [])

  return (
    <div className="portal-home__table-thumb" aria-hidden={!imageUrl}>
      {imageUrl && !failed ? (
        mediaType === "video" ? (
          <>
            <video
              src={imageUrl}
              width={THUMB_SIZE}
              height={THUMB_SIZE}
              muted
              playsInline
              preload="metadata"
            />
            <span className="portal-home__table-thumb-play">
              <IconPlayerPlay size={14} stroke={1.5} />
            </span>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={alt}
            width={THUMB_SIZE}
            height={THUMB_SIZE}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={handleImgError}
          />
        )
      ) : (
        <span className="portal-home__table-thumb-empty">
          <IconPhoto size={18} stroke={1.5} />
        </span>
      )}
    </div>
  )
}
