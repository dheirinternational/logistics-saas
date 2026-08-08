import { compressImage } from "@/lib/media/compressImage"

export type UploadedMediaAsset = {
  publicUrl: string
  fileName: string
  sizeBytes: number
}

/**
 * Uploads a local photo to Supabase storage bypassing body limits
 * with automatic client-side compression.
 */
export async function uploadCustomerProcurementFile(
  file: File
): Promise<{ ok: boolean; message?: string; asset?: UploadedMediaAsset }> {
  try {
    // 1. Compress image client-side to ensure fast and lightweight upload
    const compressedBlob = await compressImage(file)
    const uploadFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
      type: "image/jpeg",
    })

    // 2. Request a signed upload URL
    const signRes = await fetch("/api/customer/media/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fileName: uploadFile.name,
        contentType: "image/jpeg",
        sizeBytes: uploadFile.size,
      }),
    })

    const signJson = await signRes.json()
    if (!signRes.ok || !signJson.success) {
      return { ok: false, message: signJson.message || "Failed to prepare upload" }
    }

    const { signedUrl, publicUrl } = signJson.data

    // 3. Directly PUT the image blob to Supabase Storage
    const putRes = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: uploadFile,
    })

    if (!putRes.ok) {
      return { ok: false, message: "Storage upload failed. Please try again." }
    }

    return {
      ok: true,
      asset: {
        publicUrl,
        fileName: uploadFile.name,
        sizeBytes: uploadFile.size,
      },
    }
  } catch (err: any) {
    console.error("Procurement upload error", err)
    return { ok: false, message: err.message || "Upload network error" }
  }
}
