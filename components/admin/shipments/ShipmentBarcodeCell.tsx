"use client"

import { useEffect, useRef } from "react"
import { IconDownload } from "@tabler/icons-react"
import JsBarcode from "jsbarcode"

export function ShipmentBarcodeCell({ trackingNumber }: { trackingNumber: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && trackingNumber) {
      try {
        JsBarcode(svgRef.current, trackingNumber, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 0,
        })
      } catch (err) {
        console.error("JsBarcode generation failed", err)
      }
    }
  }, [trackingNumber])

  const handleDownload = () => {
    if (!svgRef.current) return

    try {
      const svgElement = svgRef.current
      const svgString = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
      const URL = window.URL || window.webkitURL || window
      const blobURL = URL.createObjectURL(svgBlob)

      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement("canvas")
        // Render at higher resolution for crisp barcode scanning
        const scale = 2
        canvas.width = svgElement.clientWidth * scale || 300
        canvas.height = svgElement.clientHeight * scale || 100
        const context = canvas.getContext("2d")
        
        if (context) {
          context.fillStyle = "#ffffff"
          context.fillRect(0, 0, canvas.width, canvas.height)
          context.scale(scale, scale)
          context.drawImage(image, 0, 0)
          
          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const downloadLink = document.createElement("a")
              downloadLink.href = URL.createObjectURL(pngBlob)
              downloadLink.download = `barcode-${trackingNumber}.png`
              document.body.appendChild(downloadLink)
              downloadLink.click()
              document.body.removeChild(downloadLink)
            }
          }, "image/png")
        }
      }
      image.src = blobURL
    } catch (err) {
      console.error("Barcode download error", err)
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
        <div style={{ background: "#ffffff", padding: "4px", borderRadius: "4px", border: "1px solid #eee", display: "inline-flex" }}>
          <svg ref={svgRef} style={{ maxHeight: "30px", maxWidth: "120px" }} />
        </div>
        <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--color-dheir-ink, #111)", fontWeight: 500 }}>
          {trackingNumber}
        </span>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--color-dheir-blue, #0056cc)",
          display: "flex",
          alignItems: "center",
          padding: "4px",
          borderRadius: "4px",
          transition: "background-color 200ms",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 86, 204, 0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        title="Download barcode image"
      >
        <IconDownload size={16} />
      </button>
    </div>
  )
}
