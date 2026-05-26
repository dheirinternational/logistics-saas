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
      "https://images.unsplash.com/photo-1778385406327-54caa75374e2?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Airplane at airport during a vibrant sunset",
  },
  {
    id: "sea",
    label: "Sea freight",
    title: "Volume without the rush",
    description:
      "Container and consolidated sea options when cost per CBM counts more than days in transit.",
    imageSrc:
      "https://images.unsplash.com/photo-1592963219385-53b52b371dd1?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Red, blue, and yellow intermodal containers",
  },
  {
    id: "express",
    label: "Consolidated",
    title: "Repack. Combine. Ship once.",
    description:
      "Warehouse consolidation and repack so multiple supplier parcels move as one clear shipment.",
    imageSrc:
      "https://images.unsplash.com/photo-1777026321659-64941fb943dd?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Warehouse storage aisles with shelves full of boxes",
  },
]
