"use client"

import { AuthField } from "@/components/auth/AuthField"
import { AuthPageShell } from "@/components/auth/AuthPageShell"
import {
  BlurReveal,
  authViewTransition,
  authViewTransitionReduced,
} from "@/components/auth/BlurReveal"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
} from "@tabler/icons-react"
import Link from "next/link"
import { resolvePostAuthEntry } from "@/lib/auth/postAuthRedirect"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"

type AuthView = "login" | "forgot-password"

function getNextParam(): string | null {
  if (typeof window === "undefined") return null
  return new URLSearchParams(window.location.search).get("next")
}

export default function LoginPage() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const viewMotion = reduceMotion ? authViewTransitionReduced : authViewTransition
  const [view, setView] = useState<AuthView>("login")
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [changePasswordEmail, setChangePasswordEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingPasswordEmail, setIsSendingPasswordEmail] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  useEffect(() => {
    redirectIfAuthenticated()
  }, [])

  const redirectIfAuthenticated = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (data.user?.role) {
        router.replace(resolvePostAuthEntry(data.user.role, getNextParam()))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handlePasswordChangeLink = async () => {
    if (!changePasswordEmail.trim()) {
      toast.error("Enter your email address")
      return
    }
    setIsSendingPasswordEmail(true)
    try {
      const res = await fetch("/api/auth/send-change-password-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: changePasswordEmail }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message ?? "Could not send reset link")
        return
      }
      toast.success(result.message)
      setView("login")
    } catch {
      toast.error("Network error. Try again.")
    } finally {
      setIsSendingPasswordEmail(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      })

      let result: { error?: string; user?: { role?: string } } = {}
      try {
        result = await res.json()
      } catch {
        toast.error(
          res.ok
            ? "Login succeeded but the server response was invalid. Refresh the page."
            : `Login failed (${res.status}). Try again in a few seconds.`
        )
        return
      }

      if (!res.ok) {
        toast.error(result.error ?? "Login failed")
        return
      }

      toast.success("Welcome back")

      const role = result.user?.role
      if (role) {
        router.replace(resolvePostAuthEntry(role, getNextParam()))
        return
      }

      await redirectIfAuthenticated()
    } catch {
      toast.error("Network error. Check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <AuthPageShell
      mobileTrailing={
        <Link
          href="/"
          className="text-sm font-medium text-dheir-muted no-underline hover:text-dheir-ink"
        >
          Home
        </Link>
      }
    >
      <AnimatePresence mode="wait">
        {view === "login" ? (
          <motion.div
            key="login"
            initial={viewMotion.initial}
            animate={viewMotion.animate}
            exit={viewMotion.exit}
          >
            <BlurReveal immediate>
              <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-dheir-ink">
                Welcome back
              </h2>
              <p className="mt-2 text-[15px] text-dheir-muted">
                Log in to manage your packages.
              </p>
            </BlurReveal>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <BlurReveal immediate delay={100}>
                <AuthField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  placeholder="you@email.com"
                  icon={<IconMail size={18} stroke={1.5} />}
                />
              </BlurReveal>

              <BlurReveal immediate delay={160}>
                <AuthField
                  label="Password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Your password"
                  icon={<IconLock size={18} stroke={1.5} />}
                  trailing={
                    <button
                      type="button"
                      className="dheir-input-action"
                      aria-label={
                        isPasswordVisible ? "Hide password" : "Show password"
                      }
                      onClick={() => setIsPasswordVisible((v) => !v)}
                    >
                      {isPasswordVisible ? (
                        <IconEyeOff size={18} stroke={1.5} />
                      ) : (
                        <IconEye size={18} stroke={1.5} />
                      )}
                    </button>
                  }
                />
              </BlurReveal>

              <BlurReveal immediate delay={220}>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-medium text-dheir-blue transition-colors hover:text-dheir-blue-hover"
                    onClick={() => setView("forgot-password")}
                  >
                    Forgot password?
                  </button>
                </div>
              </BlurReveal>

              <BlurReveal immediate delay={280}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="dheir-btn-primary"
                >
                  {isLoading ? (
                    <DHEIRLoader color="#fff" size={20} />
                  ) : (
                    "Log in"
                  )}
                </button>
              </BlurReveal>
            </form>

            <BlurReveal immediate delay={340}>
              <p className="mt-8 text-center text-sm text-dheir-muted">
                No account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-dheir-blue underline-offset-2 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </BlurReveal>
          </motion.div>
        ) : (
          <motion.div
            key="forgot"
            initial={viewMotion.initial}
            animate={viewMotion.animate}
            exit={viewMotion.exit}
          >
            <button
              type="button"
              className="mb-8 flex items-center gap-1.5 text-sm font-medium text-dheir-muted transition-colors hover:text-dheir-ink"
              onClick={() => setView("login")}
            >
              <IconArrowLeft size={16} stroke={1.5} />
              Back
            </button>

            <BlurReveal immediate>
              <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-dheir-ink">
                Reset password
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-dheir-muted">
                We will email you a link to choose a new password.
              </p>
            </BlurReveal>

            <div className="mt-10">
              <BlurReveal immediate delay={100}>
                <AuthField
                  label="Email"
                  name="reset_email"
                  type="email"
                  value={changePasswordEmail}
                  onChange={(e) =>
                    setChangePasswordEmail(e.currentTarget.value)
                  }
                  placeholder="you@email.com"
                  icon={<IconMail size={18} stroke={1.5} />}
                />
              </BlurReveal>

              <BlurReveal immediate delay={180}>
                <button
                  type="button"
                  disabled={isSendingPasswordEmail}
                  className="dheir-btn-primary mt-6"
                  onClick={handlePasswordChangeLink}
                >
                  {isSendingPasswordEmail ? (
                    <DHEIRLoader color="#fff" size={20} />
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </BlurReveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-10 text-center text-xs leading-relaxed text-dheir-muted">
        By continuing you agree to DHEIR service terms.
      </p>
    </AuthPageShell>
  )
}
