/** Trust / policy topics — copy from legacy /customer notice, shortened for landing. */

export type TrustItem = {
  id: string
  label: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    id: "cbm",
    label: "Accurate CBM",
    title: "Accurate CBM",
    description:
      "We measure and quote CBM clearly, repack when needed, and consolidate goods so you pay for what you ship, not guesswork.",
    imageSrc:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Stacked packages and boxes",
  },
  {
    id: "onitsha",
    label: "Onitsha",
    title: "Onitsha delivery",
    description:
      "Interstate delivery to Onitsha and surrounding areas through our established Nigeria network.",
    imageSrc:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Freight truck on road",
  },
  {
    id: "kano",
    label: "Kano",
    title: "Kano delivery",
    description:
      "Shipments to Kano are handled with the same tracked pipeline from China warehouse to your door.",
    imageSrc:
      "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Cargo logistics",
  },
  {
    id: "waybill",
    label: "Waybill states",
    title: "Other states via waybill",
    description:
      "Outside our direct routes, we deliver via waybill partners so your goods still reach you reliably.",
    imageSrc:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Warehouse and logistics",
  },
  {
    id: "lithium",
    label: "Lithium policy",
    title: "Lithium policy",
    description:
      "We no longer ship lithium batteries, power banks, or related restricted items, for safer air and sea handling.",
    imageSrc:
      "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Air freight",
  },
  {
    id: "inspection",
    label: "1CBM+ inspection",
    title: "Inspection from 1CBM",
    description:
      "Request inspection of selected packages on shipments from 1CBM and above before you pay to release.",
    imageSrc:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Team reviewing shipment details",
  },
]

export const TRUST_HEADLINE = {
  badge: "Trust & policies",
  before: "Shipping you can trust from",
  highlight: "China to Nigeria",
} as const
