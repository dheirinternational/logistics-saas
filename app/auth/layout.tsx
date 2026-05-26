import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell min-h-dvh bg-dheir-page font-sans text-dheir-ink antialiased">
      {children}
    </div>
  )
}
