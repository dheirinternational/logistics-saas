"use client"

import { useState } from "react"
import { IconPlayerPlay, IconX, IconMaximize } from "@tabler/icons-react"

export function FloatingVideoWidget() {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  if (isDismissed) return null

  return (
    <>
      {/* Collapsed Widget */}
      {!isExpanded && (
        <div 
          className="fixed bottom-6 left-6 z-40 group"
          style={{ width: "200px" }}
        >
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-[var(--color-dheir-border)] bg-black cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <video 
              src="/video/intro-to-dheir.mp4"
              className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
              muted
              playsInline
              preload="metadata"
            />
            {/* Clickable Overlay to Expand */}
            <div 
              onClick={() => setIsExpanded(true)}
              className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/15 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-white/90 text-dheir-blue flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                <IconPlayerPlay size={20} fill="currentColor" stroke={1.5} className="ml-0.5" />
              </div>
            </div>
            
            {/* Close Button to Dismiss Widget */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsDismissed(true)
              }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors border-0"
              aria-label="Dismiss video"
            >
              <IconX size={14} />
            </button>

            {/* Label Overlay */}
            <div className="absolute bottom-1.5 left-2 right-2 flex justify-between items-center text-[10px] text-white/90 font-medium pointer-events-none drop-shadow">
              <span>Intro Video</span>
              <IconMaximize size={12} />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Overlay Card */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="relative max-w-3xl w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <video 
              src="/video/intro-to-dheir.mp4"
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
            
            {/* Collapse/Close Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10"
              aria-label="Close player"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
