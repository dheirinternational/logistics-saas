"use client"

import { IconPhoto, IconPlayerPlay } from "@tabler/icons-react"
import { MediaVaultThumbnail } from "@/components/admin/media/MediaVaultThumbnail"

type Props = {
  imageUrl?: string | null
  mediaType?: "image" | "video" | null
  alt?: string
}

export function ProductCoverThumb({ imageUrl, mediaType, alt = "" }: Props) {
  return (
    <div className="portal-home__table-thumb" aria-hidden={!imageUrl}>
      {imageUrl ? (
        mediaType === "video" ? (
          <>
            <video src={imageUrl} muted playsInline preload="metadata" />
            <span className="portal-home__table-thumb-play">
              <IconPlayerPlay size={14} stroke={1.5} />
            </span>
          </>
        ) : (
          <MediaVaultThumbnail src={imageUrl} alt={alt} />
        )
      ) : (
        <span className="portal-home__table-thumb-empty">
          <IconPhoto size={18} stroke={1.5} />
        </span>
      )}
    </div>
  )
}
