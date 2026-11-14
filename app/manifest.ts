import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/marketing/siteMetadata"
import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "DHEIR",
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a5fff",
    icons: [
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/dheir-logo-square.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
