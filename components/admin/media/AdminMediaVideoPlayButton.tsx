"use client"

import { IconPlayerPlay } from "@tabler/icons-react"
import type { MouseEvent } from "react"

type Props = {
  onPlay: () => void
  ariaLabel?: string
}

export function AdminMediaVideoPlayButton({
  onPlay,
  ariaLabel = "Play video fullscreen",
}: Props) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onPlay()
  }

  return (
    <button
      type="button"
      className="admin-uploader__play-btn media-vault-card__play-btn"
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <IconPlayerPlay size={28} stroke={1.5} aria-hidden />
    </button>
  )
}
