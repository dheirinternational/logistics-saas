"use client"

import { useState, useRef } from "react"
import { IconPhoto, IconTrash, IconPlus, IconLoader2, IconUpload } from "@tabler/icons-react"
import { uploadCustomerProcurementFile } from "@/lib/media/uploadCustomerProcurementFile"
import { toast } from "@/lib/ui/toast"
import Image from "next/image"

type Props = {
  label: string
  helperText?: string
  maxPhotos?: number
  value: string[]
  onChange: (urls: string[]) => void
}

export function LocalPhotoUploader({
  label,
  helperText = "Upload high-resolution sample photos from your phone or device",
  maxPhotos = 3,
  value = [],
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (value.length + files.length > maxPhotos) {
      toast.error(`You can upload at most ${maxPhotos} photos.`)
      return
    }

    setUploading(true)
    const newUrls: string[] = []

    for (const file of files) {
      const res = await uploadCustomerProcurementFile(file)
      if (res.ok && res.asset) {
        newUrls.push(res.asset.publicUrl)
      } else {
        toast.error(res.message || `Failed to upload ${file.name}`)
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls])
      toast.success(`${newUrls.length} photo(s) uploaded successfully!`)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div>
        <span className="portal-packages__field-label" style={{ fontWeight: 600 }}>
          {label}
        </span>
        {helperText && (
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-dheir-muted)" }}>
            {helperText} (Max {maxPhotos} images)
          </p>
        )}
      </div>

      {/* Grid of uploaded photos & upload drop trigger */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        {value.map((url, idx) => (
          <div
            key={idx}
            style={{
              position: "relative",
              width: "88px",
              height: "88px",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid var(--color-dheir-border)",
              backgroundColor: "#f8fafc",
            }}
          >
            <Image
              src={url}
              alt={`Photo ${idx + 1}`}
              fill
              className="object-cover"
              sizes="88px"
              unoptimized
            />
            <button
              type="button"
              onClick={() => removePhoto(idx)}
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                background: "rgba(0, 0, 0, 0.65)",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title="Remove photo"
            >
              <IconTrash size={12} stroke={2} />
            </button>
          </div>
        ))}

        {value.length < maxPhotos && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "10px",
                border: "1px dashed var(--color-dheir-border)",
                backgroundColor: "var(--color-dheir-surface)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                cursor: uploading ? "not-allowed" : "pointer",
                color: "var(--color-dheir-blue)",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {uploading ? (
                <>
                  <IconLoader2 size={20} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <IconUpload size={20} stroke={1.5} />
                  <span>Upload Photo</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
