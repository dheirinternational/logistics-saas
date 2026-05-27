"use client"

import { AuthField } from "@/components/auth/AuthField"
import { AuthOtpSheet } from "@/components/auth/AuthOtpSheet"
import { AuthPageShell } from "@/components/auth/AuthPageShell"
import { BlurReveal } from "@/components/auth/BlurReveal"
import {
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconPhone,
  IconUser,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

export default function SignupPage() {
  const router = useRouter()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isOtpOpen, setIsOtpOpen] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState("")

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setCredentials((prev) => ({ ...prev, [name]: value }))
    if (name === "email") {
      const normalized = value.trim().toLowerCase()
      if (normalized !== verifiedEmail) {
        setIsEmailVerified(false)
      }
    }
  }

  const validateSignupForm = (): boolean => {
    if (!credentials.first_name.trim() || !credentials.last_name.trim()) {
      toast.error("Enter your first and last name")
      return false
    }
    if (!credentials.email.trim() || !credentials.email.includes("@")) {
      toast.error("Enter a valid email address")
      return false
    }
    if (!credentials.phone.trim()) {
      toast.error("Enter your phone number")
      return false
    }
    if (credentials.password.length < 7) {
      toast.error("Password must be at least 7 characters")
      return false
    }
    return true
  }

  const completeRegistration = async () => {
    setIsCreatingAccount(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
          first_name: credentials.first_name.trim(),
          last_name: credentials.last_name.trim(),
          phone: credentials.phone.trim(),
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message ?? "Could not create account")
        if (res.status === 403) {
          setIsEmailVerified(false)
          setVerifiedEmail("")
        }
        return
      }
      toast.success(result.message ?? "Account created")
      router.push("/customer")
    } catch {
      toast.error("Could not create account. Try again.")
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateSignupForm()) return

    const email = credentials.email.trim().toLowerCase()

    if (!isEmailVerified || verifiedEmail !== email) {
      setIsOtpOpen(true)
      return
    }

    await completeRegistration()
  }

  const handleVerified = async () => {
    const email = credentials.email.trim().toLowerCase()
    setIsEmailVerified(true)
    setVerifiedEmail(email)
    setIsOtpOpen(false)
    await completeRegistration()
  }

  return (
    <AuthPageShell
      maxWidthClass="max-w-[440px]"
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
          Create account
        </h2>
        <p className="mt-2 text-[15px] text-dheir-muted">
          A few details to get you started. We will email you a verification code
          when you continue.
        </p>
      </BlurReveal>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <BlurReveal immediate delay={80}>
            <AuthField
              label="First name"
              name="first_name"
              required
              value={credentials.first_name}
              onChange={handleInputChange}
              placeholder="Ada"
              icon={<IconUser size={18} stroke={1.5} />}
            />
          </BlurReveal>
          <BlurReveal immediate delay={120}>
            <AuthField
              label="Last name"
              name="last_name"
              required
              value={credentials.last_name}
              onChange={handleInputChange}
              placeholder="Okafor"
              icon={<IconUser size={18} stroke={1.5} />}
            />
          </BlurReveal>
        </div>

        <BlurReveal immediate delay={160}>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-dheir-ink">
              Email
            </span>
            <span className="relative block">
              <IconMail
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-dheir-muted"
                size={18}
                stroke={1.5}
              />
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="you@email.com"
                className={`dheir-input pl-11 ${
                  isEmailVerified &&
                  verifiedEmail === credentials.email.trim().toLowerCase()
                    ? "pr-11"
                    : "pr-4"
                }`}
              />
              {isEmailVerified &&
              verifiedEmail === credentials.email.trim().toLowerCase() ? (
                <span
                  className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-emerald-600"
                  aria-label="Email verified"
                >
                  <IconCheck size={20} stroke={2} />
                </span>
              ) : null}
            </span>
            <p className="mt-2 text-[13px] leading-relaxed text-dheir-muted">
              {isEmailVerified &&
              verifiedEmail === credentials.email.trim().toLowerCase()
                ? "Email verified. You can create your account."
                : "We will send a 6-digit code to this address when you tap Create account."}
            </p>
          </label>
        </BlurReveal>

        <BlurReveal immediate delay={200}>
          <AuthField
            label="Phone"
            name="phone"
            type="tel"
            required
            value={credentials.phone}
            onChange={handleInputChange}
            placeholder="+234..."
            icon={<IconPhone size={18} stroke={1.5} />}
          />
        </BlurReveal>

        <BlurReveal immediate delay={240}>
          <AuthField
            label="Create password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            required
            autoComplete="new-password"
            value={credentials.password}
            onChange={handleInputChange}
            placeholder="At least 7 characters"
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

        <BlurReveal immediate delay={280}>
          <button
            type="submit"
            disabled={isCreatingAccount}
            className="dheir-btn-primary mt-2"
          >
            {isCreatingAccount ? (
              <DheirLoader color="#fff" size={20} />
            ) : isEmailVerified &&
              verifiedEmail === credentials.email.trim().toLowerCase() ? (
              "Create account"
            ) : (
              "Continue"
            )}
          </button>
        </BlurReveal>
      </form>

      <BlurReveal immediate delay={340}>
        <p className="mt-8 text-center text-sm text-dheir-muted">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-dheir-blue underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      </BlurReveal>

      <AuthOtpSheet
        open={isOtpOpen}
        email={credentials.email.trim().toLowerCase()}
        autoSend
        onClose={() => setIsOtpOpen(false)}
        onVerified={handleVerified}
      />
    </AuthPageShell>
  )
}
