import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell min-h-dvh bg-dheir-page font-sans text-dheir-ink antialiased">
      {children}
    </div>
  )
}
