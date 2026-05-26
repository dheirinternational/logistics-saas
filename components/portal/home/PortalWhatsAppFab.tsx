import { IconBrandWhatsapp } from "@tabler/icons-react"

const WHATSAPP_URL = "https://wa.link/68r8i8"

export function PortalWhatsAppFab() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="portal-home__whatsapp"
      aria-label="Chat on WhatsApp"
    >
      <IconBrandWhatsapp size={28} stroke={1.5} aria-hidden />
    </a>
  )
}
