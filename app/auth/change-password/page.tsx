"use client"

import { AuthField } from "@/components/auth/AuthField"
import { AuthLoadingFallback } from "@/components/auth/AuthLoadingFallback"
import { AuthPageShell } from "@/components/auth/AuthPageShell"
import { BlurReveal } from "@/components/auth/BlurReveal"
import { IconEye, IconEyeOff, IconLock } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <ChangePasswordForm />
    </Suspense>
  )
}

function ChangePasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  const changePassword = async () => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (password.length < 7) {
      toast.error("Password must be at least 7 characters")
      return
    }

    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Fill in both fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!token || !email) {
      toast.error("Invalid or expired reset link")
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch(
        `/api/auth/forgot-password-change?token=${token}&email=${email}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      )
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.push("/auth/login")
    } catch {
      toast.error("Could not update password. Try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

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
        <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-dheir-ink">
          New password
        </h2>
        <p className="mt-2 text-[15px] text-dheir-muted">
          Enter and confirm your new password.
        </p>
      </BlurReveal>

      <div className="mt-10 space-y-5">
        <BlurReveal immediate delay={100}>
          <AuthField
            label="Password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Min. 7 characters"
            icon={<IconLock size={18} stroke={1.5} />}
            trailing={
              <button
                type="button"
                className="dheir-input-action"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
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

        <BlurReveal immediate delay={160}>
          <AuthField
            label="Confirm password"
            name="confirm_password"
            type={isConfirmPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            placeholder="Repeat password"
            icon={<IconLock size={18} stroke={1.5} />}
            trailing={
              <button
                type="button"
                className="dheir-input-action"
                aria-label={
                  isConfirmPasswordVisible ? "Hide password" : "Show password"
                }
                onClick={() => setIsConfirmPasswordVisible((v) => !v)}
              >
                {isConfirmPasswordVisible ? (
                  <IconEyeOff size={18} stroke={1.5} />
                ) : (
                  <IconEye size={18} stroke={1.5} />
                )}
              </button>
            }
          />
        </BlurReveal>

        <BlurReveal immediate delay={220}>
          <button
            type="button"
            disabled={
              isChangingPassword || !password.trim() || !confirmPassword.trim()
            }
            className="dheir-btn-primary"
            onClick={changePassword}
          >
            {isChangingPassword ? (
              <DheirLoader color="#fff" size={20} />
            ) : (
              "Update password"
            )}
          </button>
        </BlurReveal>
      </div>
    </AuthPageShell>
  )
}
