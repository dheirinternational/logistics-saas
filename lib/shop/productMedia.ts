export type ProductMediaItem = {
  id: number
  image_url: string
  media_type?: string | null
  is_primary?: boolean
}

export function isVideoMedia(mediaType?: string | null) {
  return mediaType === "video"
}

/** Prefer a still image for cards and gallery hero; fall back to any media. */
export function pickPreferredProductImage(images: ProductMediaItem[]) {
  if (images.length < 1) return null
  return images.find((img) => !isVideoMedia(img.media_type)) ?? images[0]
}

export function sortProductImagesForGallery<T extends ProductMediaItem>(images: T[]) {
  return [...images].sort((a, b) => {
    const aVideo = isVideoMedia(a.media_type) ? 1 : 0
    const bVideo = isVideoMedia(b.media_type) ? 1 : 0
    if (aVideo !== bVideo) return aVideo - bVideo
    if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
      return a.is_primary ? -1 : 1
    }
    return a.id - b.id
  })
}
