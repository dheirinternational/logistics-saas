import { LegalPlaceholder } from "@/components/marketing/LegalPlaceholder"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | DHEIR International",
  description: "Privacy Policy for DHEIR International.",
}

export default function PrivacyPage() {
  return <LegalPlaceholder title="Privacy Policy" />
}
