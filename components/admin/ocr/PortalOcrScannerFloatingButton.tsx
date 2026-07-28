"use client"

import { useState, useRef, useEffect } from "react"
import {
  IconScan,
  IconX,
  IconCopy,
  IconCheck,
  IconLoader2,
  IconUpload,
  IconCamera,
  IconRefresh,
} from "@tabler/icons-react"
import { toast } from "@/lib/ui/toast"

type ExtractedData = {
  customerName: string | null
  cost: number | null
  shippingId: string | null
}

export function PortalOcrScannerFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ExtractedData | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Camera WebRTC States
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async () => {
    setResult(null)
    setSelectedFile(null)
    setPreviewUrl(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      setStream(mediaStream)
      setCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Camera access error:", err)
      toast.error("Could not access camera. Falling back to file uploader.")
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen])

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement("canvas")
      // Match high resolution of video feed
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-receipt.jpg", { type: "image/jpeg" })
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(blob))
            stopCamera()
          }
        }, "image/jpeg", 0.95)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      stopCamera()
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
    }
  }

  const handleScan = async () => {
    if (!selectedFile) return

    setIsScanning(true)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch("/api/ocr/scan", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to scan receipt")
      }

      setResult(data.data)
      toast.success("Receipt scanned successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to scan receipt")
      console.error(err)
    } finally {
      setIsScanning(false)
    }
  }

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Copied ${fieldName}!`)
    setTimeout(() => {
      setCopiedField(null)
    }, 1500)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setIsScanning(false)
    stopCamera()
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--color-dheir-ink, #111)",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          zIndex: 999,
          transition: "transform 200ms ease, background-color 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)"
          e.currentTarget.style.backgroundColor = "var(--color-dheir-blue, #0056cc)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)"
          e.currentTarget.style.backgroundColor = "var(--color-dheir-ink, #111)"
        }}
        aria-label="Scan receipt"
      >
        <IconScan size={24} stroke={2} />
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="dheir-dialog-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
          style={{ zIndex: 1000 }}
        >
          <div
            className="dheir-dialog admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Receipt OCR Scanner"
            style={{ maxWidth: "520px" }}
          >
            <div className="dheir-dialog__head">
              <div>
                <h2 className="dheir-dialog__title">Receipt Live Scanner</h2>
                <p className="admin-modal__subtitle">
                  Use device camera to snap and extract Customer Name, Cost, and Tracking ID.
                </p>
              </div>
              <button
                type="button"
                className="dheir-dialog__close"
                onClick={handleClose}
                aria-label="Close"
              >
                <IconX size={20} stroke={1.5} />
              </button>
            </div>

            <div className="admin-modal__body" style={{ padding: "20px" }}>
              
              {/* Live Camera Viewfinder */}
              {cameraActive && !previewUrl && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "440px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "2px solid var(--color-dheir-border)",
                      backgroundColor: "#000",
                    }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    
                    {/* Targeting scanning guides - tall portrait layout */}
                    <div
                      style={{
                        position: "absolute",
                        top: "5%",
                        left: "15%",
                        right: "15%",
                        bottom: "5%",
                        border: "2px dashed rgba(255, 255, 255, 0.5)",
                        borderRadius: "8px",
                        pointerEvents: "none",
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
                      }}
                    />
                  </div>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={handleCapture}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: "8px",
                        backgroundColor: "var(--color-dheir-blue)",
                        color: "#fff",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <IconCamera size={20} />
                      Capture Receipt
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-dheir-border)",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Upload file instead"
                    >
                      <IconUpload size={20} stroke={1.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* File Uploader Fallback (if camera not active/failed) */}
              {!cameraActive && !previewUrl && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--color-dheir-border)",
                    borderRadius: "12px",
                    padding: "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "rgba(0, 0, 0, 0.01)",
                  }}
                >
                  <IconUpload
                    size={36}
                    stroke={1.5}
                    style={{ color: "var(--color-dheir-muted)", marginBottom: "12px" }}
                  />
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
                    Click to upload receipt image
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-dheir-muted)" }}>
                    No camera detected. Supports JPG, PNG, WEBP.
                  </p>
                </div>
              )}

              {/* File selector input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />

              {/* Preview and Scan trigger */}
              {previewUrl && !isScanning && !result && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "380px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid var(--color-dheir-border)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Captured preview"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={handleScan}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: "8px",
                        backgroundColor: "var(--color-dheir-blue)",
                        color: "#fff",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Scan Receipt
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-dheir-border)",
                        backgroundColor: "transparent",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <IconRefresh size={16} />
                      Retake
                    </button>
                  </div>
                </div>
              )}

              {/* Scanning state */}
              {isScanning && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "40px 20px",
                    gap: "12px",
                  }}
                >
                  <IconLoader2
                    size={36}
                    stroke={1.5}
                    className="animate-spin"
                    style={{ color: "var(--color-dheir-blue)" }}
                  />
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
                    Scanning receipt with Gemini AI...
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--color-dheir-muted)" }}>
                    Extracting structured information
                  </p>
                </div>
              )}

              {/* Results layout */}
              {result && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Customer Name Field */}
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-dheir-muted)", marginBottom: "4px" }}>
                        Customer Name
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          readOnly
                          value={result.customerName || "Not found"}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--color-dheir-border)",
                            background: "rgba(0, 0, 0, 0.02)",
                            fontSize: "14px",
                          }}
                        />
                        {result.customerName && (
                          <button
                            type="button"
                            onClick={() => handleCopy(result.customerName!, "Customer Name")}
                            style={{
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid var(--color-dheir-border)",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            {copiedField === "Customer Name" ? (
                              <IconCheck size={16} stroke={1.5} style={{ color: "green" }} />
                            ) : (
                              <IconCopy size={16} stroke={1.5} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cost Field */}
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-dheir-muted)", marginBottom: "4px" }}>
                        Cost / Total Price
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          readOnly
                          value={result.cost != null ? `₦${result.cost.toLocaleString()}` : "Not found"}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--color-dheir-border)",
                            background: "rgba(0, 0, 0, 0.02)",
                            fontSize: "14px",
                          }}
                        />
                        {result.cost != null && (
                          <button
                            type="button"
                            onClick={() => handleCopy(String(result.cost), "Cost")}
                            style={{
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid var(--color-dheir-border)",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            {copiedField === "Cost" ? (
                              <IconCheck size={16} stroke={1.5} style={{ color: "green" }} />
                            ) : (
                              <IconCopy size={16} stroke={1.5} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Shipping ID Field */}
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-dheir-muted)", marginBottom: "4px" }}>
                        Shipping ID
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          readOnly
                          value={result.shippingId || "Not found"}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--color-dheir-border)",
                            background: "rgba(0, 0, 0, 0.02)",
                            fontSize: "14px",
                            fontFamily: "monospace",
                          }}
                        />
                        {result.shippingId && (
                          <button
                            type="button"
                            onClick={() => handleCopy(result.shippingId!, "Shipping ID")}
                            style={{
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid var(--color-dheir-border)",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            {copiedField === "Shipping ID" ? (
                              <IconCheck size={16} stroke={1.5} style={{ color: "green" }} />
                            ) : (
                              <IconCopy size={16} stroke={1.5} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-dheir-border)",
                      backgroundColor: "transparent",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Scan Another Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
