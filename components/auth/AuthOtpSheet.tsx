"use client"

import { dheirEase } from "@/lib/motion/dheir"
import { AnimatePresence, motion } from "framer-motion"
import { IconX } from "@tabler/icons-react"
import { useCallback, useEffect, useState } from "react"
import { ClipLoader } from "react-spinners"
import { toast } from "react-toastify"

type AuthOtpSheetProps = {
  open: boolean
  email: string
  autoSend?: boolean
  onClose: () => void
  onVerified: () => void
}

export function AuthOtpSheet({
  open,
  email,
  autoSend = true,
  onClose,
  onVerified,
}: AuthOtpSheetProps) {
  const [countDown, setCountDown] = useState(0)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [otp, setOtp] = useState("")
  const [hasSentOnce, setHasSentOnce] = useState(false)

  const sendOtp = useCallback(async () => {
    if (!email.trim()) {
      toast.error("Enter your email on the form first")
      return
    }

    setIsSendingOtp(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const result = await res.json()

      if (!res.ok) {
        if (typeof result.retryAfterSeconds === "number") {
          setCountDown(result.retryAfterSeconds)
        }
        toast.error(result.message ?? "Could not send code")
        return
      }

      setHasSentOnce(true)
      setCountDown(
        typeof result.retryAfterSeconds === "number"
          ? result.retryAfterSeconds
          : 60
      )
      toast.success(result.message ?? "Code sent. Check your inbox.")
    } catch {
      toast.error("Could not send code. Try again.")
    } finally {
      setIsSendingOtp(false)
    }
  }, [email])

  useEffect(() => {
    if (!open) return
    setOtp("")
    setHasSentOnce(false)
    setCountDown(0)
  }, [open, email])

  useEffect(() => {
    if (!open || !autoSend || !email.trim()) return
    sendOtp()
  }, [open, autoSend, email, sendOtp])

  useEffect(() => {
    if (!open || countDown <= 0) return
    const id = setInterval(() => setCountDown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [open, countDown])

  const verifyOtp = async () => {
    const code = otp.replace(/\D/g, "")
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your email")
      return
    }

    setIsVerifyingEmail(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code, email }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message ?? "Could not verify code")
        return
      }
      toast.success("Email verified")
      onVerified()
      onClose()
    } catch {
      toast.error("Could not verify code. Try again.")
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  const handleOtpChange = (value: string) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6))
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-dheir-ink/40 backdrop-blur-[3px]"
            aria-label="Close"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="otp-title"
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--color-dheir-border)] bg-dheir-surface px-6 pb-8 pt-6 shadow-[var(--shadow-dheir-lift)] sm:rounded-2xl"
            initial={{ y: "100%", opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.95 }}
            transition={{ duration: 0.45, ease: dheirEase }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-dheir-blue">
                  Verify email
                </p>
                <h2
                  id="otp-title"
                  className="font-display mt-2 text-xl font-bold tracking-tight text-dheir-ink"
                >
                  Check your inbox
                </h2>
              </div>
              <button
                type="button"
                className="dheir-input-action shrink-0"
                onClick={onClose}
                aria-label="Close"
              >
                <IconX size={20} stroke={1.5} />
              </button>
            </div>

            <p className="text-[15px] leading-relaxed text-dheir-muted">
              {hasSentOnce ? (
                <>
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-dheir-ink">{email}</span>.
                  Enter it below to continue.
                </>
              ) : (
                <>
                  Sending a verification code to{" "}
                  <span className="font-semibold text-dheir-ink">{email}</span>
                  …
                </>
              )}
            </p>

            <label className="mt-6 block">
              <span className="sr-only">Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="dheir-input pl-4 text-center text-lg font-semibold tracking-[0.35em] tabular-nums"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                placeholder="000000"
                autoFocus
              />
            </label>

            <p className="mt-4 text-sm text-dheir-muted">
              Did not get it?{" "}
              {countDown > 0 ? (
                <span>
                  Resend in{" "}
                  <span className="font-semibold tabular-nums text-dheir-ink">
                    {countDown}s
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  className="font-semibold text-dheir-blue transition-colors hover:text-dheir-blue-hover disabled:opacity-60"
                  disabled={isSendingOtp}
                  onClick={sendOtp}
                >
                  {isSendingOtp ? "Sending…" : "Resend code"}
                </button>
              )}
            </p>

            <button
              type="button"
              disabled={isVerifyingEmail || otp.length !== 6}
              className="dheir-btn-primary mt-6"
              onClick={verifyOtp}
            >
              {isVerifyingEmail ? (
                <ClipLoader color="#fff" size={20} />
              ) : (
                "Verify and continue"
              )}
            </button>

            <button
              type="button"
              className="mt-3 w-full text-center text-sm font-medium text-dheir-muted transition-colors hover:text-dheir-ink"
              onClick={onClose}
            >
              Back to form
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
