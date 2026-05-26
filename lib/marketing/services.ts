/** Service column imagery — replace with client assets when available. */

export const SERVICES_SECTION_COPY = {
  eyebrow: "Services",
  title: "Air, sea, and consolidation",
  subline:
    "Three ways to move freight from China to Nigeria. Pick the lane that fits your timeline and budget.",
} as const

export type ServiceVariant = "air" | "sea" | "express"

export type MarketingService = {
  id: ServiceVariant
  label: string 
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

export const MARKETING_SERVICES: MarketingService[] = [
  {
    id: "air",
    label: "Air freight",
    title: "Fast when timing matters",
    description:
      "Express air routes for urgent restocks and time-sensitive shipments from China to Nigeria.",
    imageSrc:
      "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Commercial aircraft at airport",
  },
  {
    id: "sea",
    label: "Sea freight",
    title: "Volume without the rush",
    description:
      "Container and consolidated sea options when cost per CBM counts more than days in transit.",
    imageSrc:
      "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Cargo containers at port",
  },
  {
    id: "express",
    label: "Consolidated",
    title: "Repack. Combine. Ship once.",
    description:
      "Warehouse consolidation and repack so multiple supplier parcels move as one clear shipment.",
    imageSrc:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Warehouse logistics and pallets",
  },
]
