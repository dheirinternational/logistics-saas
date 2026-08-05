/**
 * Compress an image file using client-side canvas rendering.
 * Resizes the image to a max dimension of 1200px while maintaining aspect ratio,
 * and exports as a JPEG with 0.75 quality.
 */
export async function compressImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas context generation failed"))
          return
        }

        const maxDimension = 1200
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw image onto canvas
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // Export as JPEG with 0.75 quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Canvas compression failed"))
            }
          },
          "image/jpeg",
          0.75
        )
      }
      img.onerror = () => reject(new Error("Image loading failed"))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("File reading failed"))
    reader.readAsDataURL(file)
  })
}
