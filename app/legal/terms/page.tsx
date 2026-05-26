import { LegalPlaceholder } from "@/components/marketing/LegalPlaceholder"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | DHEIR International",
  description: "Terms of Service for DHEIR International.",
}

export default function TermsPage() {
  return <LegalPlaceholder title="Terms of Service" />
}
