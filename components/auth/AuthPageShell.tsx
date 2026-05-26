"use client"

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel"
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader"
import type { ReactNode } from "react"

type AuthPageShellProps = {
  children: ReactNode
  maxWidthClass?: string
  imageSrc?: string
  mobileTrailing?: ReactNode
}

export function AuthPageShell({
  children,
  maxWidthClass = "max-w-[400px]",
  imageSrc,
  mobileTrailing,
}: AuthPageShellProps) {
  return (
    <div className="auth-layout grid min-h-dvh w-full lg:grid-cols-2">
      <AuthBrandPanel imageSrc={imageSrc} />

      <section className="flex min-h-dvh min-w-0 flex-col overflow-y-auto bg-dheir-page">
        <AuthMobileHeader trailing={mobileTrailing} />

        <div className="flex flex-1 items-center justify-center px-5 pb-10 pt-2 sm:px-10 lg:px-14 lg:py-12">
          <div className={`w-full ${maxWidthClass}`}>{children}</div>
        </div>
      </section>
    </div>
  )
}
