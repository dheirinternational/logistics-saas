"use client"

import { AuthLoadingFallback } from "@/components/auth/AuthLoadingFallback"
import { AuthPageShell } from "@/components/auth/AuthPageShell"
import { BlurReveal } from "@/components/auth/BlurReveal"
import { dheirEase } from "@/lib/motion/dheir"
import { motion } from "framer-motion"
import {
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
} from "@tabler/icons-react"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type VerifyStatus = "verifying" | "success" | "error"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<VerifyStatus>("verifying")

  useEffect(() => {
    const token = searchParams.get("token")

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email-final?token=${token}`)
        const data = await res.json()
        if (data.success) {
          setStatus("success")
          setTimeout(() => router.push("/auth/login"), 2500)
        } else {
          setStatus("error")
        }
      } catch {
        setStatus("error")
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <AuthPageShell
      mobileTrailing={
        <Link
          href="/auth/login"
          className="text-sm font-medium text-dheir-muted no-underline hover:text-dheir-ink"
        >
          Log in
        </Link>
      }
    >
      <BlurReveal immediate>
        <motion.div
          className="rounded-2xl border border-[var(--color-dheir-border)] bg-dheir-surface px-6 py-10 text-center shadow-[var(--shadow-dheir-soft)]"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: dheirEase }}
        >
          {status === "verifying" && (
            <>
              <IconLoader2
                size={40}
                stroke={1.5}
                className="mx-auto animate-spin text-dheir-blue"
              />
              <h2 className="font-display mt-6 text-xl font-bold text-dheir-ink">
                Verifying email
              </h2>
              <p className="mt-2 text-sm text-dheir-muted">
                This only takes a moment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <IconCircleCheck
                size={48}
                stroke={1.5}
                className="mx-auto text-emerald-600"
              />
              <h2 className="font-display mt-6 text-xl font-bold text-dheir-ink">
                Email verified
              </h2>
              <p className="mt-2 text-sm text-dheir-muted">
                Redirecting you to log in.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <IconCircleX
                size={48}
                stroke={1.5}
                className="mx-auto text-dheir-red"
              />
              <h2 className="font-display mt-6 text-xl font-bold text-dheir-ink">
                Link invalid
              </h2>
              <p className="mt-2 text-sm text-dheir-muted">
                This link may have expired. Request a new one from signup or
                support.
              </p>
              <Link
                href="/auth/signup"
                className="dheir-btn-primary mt-8 flex no-underline"
              >
                Back to signup
              </Link>
            </>
          )}
        </motion.div>
      </BlurReveal>
    </AuthPageShell>
  )
}
