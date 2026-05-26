import type { ReactNode } from "react"

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-dheir-page font-sans text-dheir-ink antialiased">
      {children}
    </div>
  )
}
