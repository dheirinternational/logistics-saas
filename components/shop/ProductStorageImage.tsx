import Image, { type ImageProps } from "next/image"

type ProductStorageImageProps = Omit<ImageProps, "unoptimized">

/** Product media is served from Supabase Storage — skip Next image optimization for faster loads. */
export function ProductStorageImage(props: ProductStorageImageProps) {
  return <Image {...props} unoptimized />
}
