import {
  generateOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/marketing/generateOgImage"

export const alt =
  "DHEIR International — China to Nigeria shipping, warehouse address, air and sea freight"
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

export default async function TwitterImage() {
  return generateOgImage()
}
