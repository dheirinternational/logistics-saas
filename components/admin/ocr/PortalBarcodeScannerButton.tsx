"use client"

import { useState, useRef, useEffect } from "react"
import {
  IconBarcode,
  IconScan,
  IconX,
  IconLoader2,
  IconCamera,
  IconRefresh,
  IconUpload,
} from "@tabler/icons-react"
import { toast } from "@/lib/ui/toast"
import { usePathname } from "next/navigation"

type ExtractedData = {
  customerName: string | null
  cost: number | null
  shippingId: string | null
  customerCode: string | null
  warehouseName: string | null
}

/** Compress image client-side using canvas before uploading */
function compressImageClientSide(file: File, maxWidth = 1200, quality = 0.7): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }))
          } else {
            resolve(file)
          }
        },
        "image/jpeg",
        quality
      )
    }
    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}

export function PortalBarcodeScannerButton() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ExtractedData | null>(null)
  const [scanElapsed, setScanElapsed] = useState(0)

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
      toast.error("Could not access camera.")
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
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-barcode.jpg", { type: "image/jpeg" })
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

  const handleScan = async (retryCount = 0) => {
    if (!selectedFile) return

    setIsScanning(true)
    setScanElapsed(0)

    const startTime = Date.now()
    const timer = setInterval(() => {
      setScanElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    try {
      const compressed = await compressImageClientSide(selectedFile)
      const formData = new FormData()
      formData.append("file", compressed)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000)

      const res = await fetch("/api/ocr/scan", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      let data: any = null
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        try {
          data = await res.json()
        } catch {
          data = null
        }
      }

      if (!res.ok) {
        throw new Error(data?.message || `Server returned status ${res.status}. Please try again.`)
      }

      setResult(data?.data || null)
      toast.success("Barcode scanned successfully!")
      
      if (data.data?.shippingId) {
        window.dispatchEvent(
          new CustomEvent("admin-shipment-scanned", {
            detail: {
              trackingNumber: data.data.shippingId,
            },
          })
        )
        handleClose()
      } else {
        toast.error("No tracking number detected in the scan.")
      }
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError"
      const msg = isTimeout ? "Scan timed out" : (err.message || "Failed to scan barcode")

      if (retryCount === 0) {
        console.warn(`Barcode scan failed, auto-retrying: ${msg}`)
        clearInterval(timer)
        setScanElapsed(0)
        return handleScan(1)
      }

      toast.error(msg)
      console.error(err)
    } finally {
      clearInterval(timer)
      setIsScanning(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setIsScanning(false)
    stopCamera()
  }

  const isShipmentsPage = pathname === "/admin/shipments" || pathname.startsWith("/admin/shipments/")

  if (!isShipmentsPage) {
    return null
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
          right: "20px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--color-dheir-blue, #0056cc)",
          color: "#ffffff",
          border: "2px solid #ffffff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
          zIndex: 9999,
          transition: "transform 200ms ease, background-color 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)"
          e.currentTarget.style.backgroundColor = "var(--color-dheir-ink, #111)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)"
          e.currentTarget.style.backgroundColor = "var(--color-dheir-blue, #0056cc)"
        }}
        aria-label="Scan barcode"
        title="Barcode Scanner"
      >
        <IconBarcode size={26} stroke={1.5} />
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
          {/* Responsive CSS styles for full screen mobile view */}
          <style>{`
            @media (max-width: 768px) {
              .ocr-dialog-responsive {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                border-radius: 0 !important;
                margin: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important;
              }
              .ocr-video-responsive, .ocr-fallback-responsive {
                height: calc(100vh - 220px) !important;
                height: calc(100dvh - 220px) !important;
              }
              .ocr-preview-responsive {
                height: calc(100vh - 220px) !important;
                height: calc(100dvh - 220px) !important;
              }
              .admin-modal__body {
                flex: 1 !important;
                overflow: hidden !important;
                padding: 10px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
            }
          `}</style>
          <div
            className="dheir-dialog admin-modal ocr-dialog-responsive"
            role="dialog"
            aria-modal="true"
            aria-label="Barcode Scanner"
            style={{ maxWidth: "960px", width: "95%" }}
          >
            <div className="dheir-dialog__head">
              <div>
                <h2 className="dheir-dialog__title">Barcode Scanner</h2>
                <p className="admin-modal__subtitle">
                  Point camera or upload an image of the shipment barcode to automatically open its details.
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
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              
              {/* Main Camera Scan Interface */}
              {!previewUrl && !isScanning && !result && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {cameraActive ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div
                          className="ocr-video-responsive"
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "540px",
                            borderRadius: "12px",
                            overflow: "hidden",
                            border: "1.5px solid var(--color-dheir-border)",
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
                          
                          {/* Targeting scanning guides */}
                          <div
                            style={{
                              position: "absolute",
                              top: "15%",
                              left: "5%",
                              right: "5%",
                              bottom: "15%",
                              border: "2px dashed rgba(255, 255, 255, 0.5)",
                              borderRadius: "8px",
                              pointerEvents: "none",
                              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
                            }}
                          />
                        </div>
                        
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={handleCapture}
                            style={{
                              flex: 1,
                              minWidth: "160px",
                              padding: "12px",
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
                            <IconCamera size={20} stroke={1.8} />
                            Capture Barcode
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              padding: "12px 20px",
                              borderRadius: "8px",
                              backgroundColor: "#ffffff",
                              color: "var(--color-dheir-ink)",
                              border: "1px solid var(--color-dheir-border)",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                            }}
                          >
                            <IconUpload size={20} stroke={1.8} />
                            Upload Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="ocr-fallback-responsive"
                        style={{
                          height: "540px",
                          border: "1.5px dashed var(--color-dheir-border)",
                          borderRadius: "12px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "20px",
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                          color: "var(--color-dheir-muted)",
                          textAlign: "center"
                        }}
                      >
                        <IconCamera size={48} stroke={1.5} style={{ marginBottom: "12px" }} />
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>No camera active or allowed</p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap", justifyContent: "center" }}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              padding: "10px 18px",
                              borderRadius: "8px",
                              backgroundColor: "var(--color-dheir-blue)",
                              color: "#fff",
                              border: "none",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "13px",
                            }}
                          >
                            <IconUpload size={18} stroke={1.8} />
                            Upload Barcode Image
                          </button>
                          <button 
                            type="button" 
                            onClick={startCamera}
                            style={{
                              padding: "10px 16px",
                              borderRadius: "8px",
                              border: "1px solid var(--color-dheir-border)",
                              backgroundColor: "#fff",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <IconRefresh size={16} stroke={1.8} />
                            Try Camera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview and Scan trigger */}
              {previewUrl && !isScanning && !result && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    className="ocr-preview-responsive"
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
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => handleScan()}
                      style={{
                        flex: 1,
                        minWidth: "140px",
                        padding: "10px 16px",
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
                      <IconScan size={18} stroke={1.8} />
                      Scan Barcode
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
                      <IconCamera size={16} stroke={1.8} />
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
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
                      <IconUpload size={16} stroke={1.8} />
                      Upload Different
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
                    Scanning barcode...
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--color-dheir-muted)" }}>
                    {scanElapsed > 0 ? `${scanElapsed}s elapsed` : "Analyzing barcode image"}
                  </p>
                  {scanElapsed >= 8 && (
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--color-dheir-muted)", fontStyle: "italic" }}>
                      Taking a moment... almost there
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
