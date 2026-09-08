"use client"

import { useState } from "react"
import { IconBrandWhatsapp, IconX, IconMessageDots } from "@tabler/icons-react"

const WHATSAPP_CHINA = "https://wa.link/68r8i8" // Lucy - China Warehouse
const WHATSAPP_NIGERIA = "https://wa.link/68r8i8" // Grace - Nigeria Clearing

export function PortalWhatsAppFab() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 z-40 flex flex-col items-end">
      {open && (
        <div className="mb-3 flex flex-col gap-2 items-end">
          <a
            href={WHATSAPP_CHINA}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <IconBrandWhatsapp size={18} stroke={1.5} />
            <span>Lucy (China Warehouse Support)</span>
          </a>
          <a
            href={WHATSAPP_NIGERIA}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
          >
            <IconBrandWhatsapp size={18} stroke={1.5} />
            <span>Grace (Nigeria Clearing and Delivery)</span>
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-transform hover:scale-105"
        aria-label="WhatsApp Support"
      >
        {open ? (
          <IconX size={24} stroke={2} />
        ) : (
          <IconBrandWhatsapp size={28} stroke={1.5} />
        )}
      </button>
    </div>
  )
}
