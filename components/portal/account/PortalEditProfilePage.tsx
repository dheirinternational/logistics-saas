"use client"

import { PortalAccountPageHeader } from "@/components/portal/account/PortalAccountPageHeader"
import {
  PortalFormField,
  PortalFormInput,
} from "@/components/portal/packages/PortalFormField"
import type { User } from "@/types/entityTypeDef"
import {
  IconCamera,
  IconCircleCheck,
  IconUser,
} from "@tabler/icons-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

type BasicDetails = Omit<
  User,
  "id" | "password" | "role" | "created_at" | "email" | "profile_img"
>

interface UserWithVerified extends User {
  email_verified: boolean
}

export function PortalEditProfilePage() {
  const router = useRouter()
  const [isEditButtonActive, setIsEditButtonActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isSendingEmailVerification, setIsSendingEmailVerification] =
    useState(false)
  const [isSendingEmailChangeVerification, setSendingEmailChangeVerification] =
    useState(false)
  const [isSendingPasswordChangeVerification, setIsSendingPasswordChangeVerification] =
    useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [user, setUser] = useState<UserWithVerified | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<BasicDetails>({
    first_name: "",
    last_name: "",
    phone: "",
  })
  const [email, setEmail] = useState({ email: "" })

  const fetchData = async () => {
    try {
      const res = await fetch("/api/users/my-data", {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch user")
      }

      const data = await res.json()
      const fetchedUser = data.data as UserWithVerified
      setUser(fetchedUser)
      setUserDetails({
        first_name: fetchedUser.first_name,
        last_name: fetchedUser.last_name,
        phone: fetchedUser.phone,
      })
      setEmail({ email: fetchedUser.email })
    } catch (err) {
      toast.error("Could not load your profile")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const profileImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload-user-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.message ?? "Error uploading image")
        return
      }

      setImage(data.imageUrl)
      router.refresh()
      toast.success("Profile photo updated")
    } catch (err) {
      console.error(err)
      toast.error("Could not upload photo")
    } finally {
      setIsImageUploading(false)
    }
  }

  const initializeEmailVerification = async () => {
    setIsSendingEmailVerification(true)
    try {
      const res = await fetch("/api/auth/verify-email-initialization")
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message)
        return
      }
      toast.success("Verification link sent to your email")
    } catch (err) {
      toast.error("Could not send verification email")
      console.error(err)
    } finally {
      setIsSendingEmailVerification(false)
    }
  }

  const initializeEmailChangeConfirmation = async () => {
    setSendingEmailChangeVerification(true)
    try {
      const res = await fetch("/api/auth/change-email/initialize-change")
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
    } catch (err) {
      toast.error("Could not start email change")
      console.error(err)
    } finally {
      setSendingEmailChangeVerification(false)
    }
  }

  const initializePasswordChangeConfirmation = async () => {
    setIsSendingPasswordChangeVerification(true)
    try {
      const res = await fetch("/api/auth/change-password/initialize-change")
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
    } catch (err) {
      toast.error("Could not start password change")
      console.error(err)
    } finally {
      setIsSendingPasswordChangeVerification(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!user) return

    const changed =
      userDetails.first_name !== user.first_name ||
      userDetails.last_name !== user.last_name ||
      userDetails.phone !== user.phone

    setIsEditButtonActive(changed)
  }, [user, userDetails])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsEditLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const res = await fetch("/api/users/my-data", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error)
        return
      }

      if (result.success) {
        toast.success("Profile updated")
        router.refresh()
        setIsEditButtonActive(false)
        await fetchData()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsEditLoading(false)
    }
  }

  const profileSrc = image ?? user?.profile_img ?? null

  if (isLoading) {
    return (
      <div className="portal-account portal-account--centered">
        <BeatLoader color="var(--color-dheir-blue)" size={12} />
      </div>
    )
  }

  return (
    <div className="portal-account">
      <PortalAccountPageHeader
        title="Edit profile"
        description="Update your name, phone, photo, email, and password."
      />

      <section className="portal-account__card" aria-label="Profile photo">
        <div className="portal-account__photo">
          <div className="portal-account__photo-figure">
            {profileSrc ? (
              <Image
                src={profileSrc}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <IconUser size={48} stroke={1.25} aria-hidden />
            )}
            {isImageUploading ? (
              <span className="portal-account__photo-overlay">
                <BeatLoader color="var(--color-dheir-blue)" size={10} />
              </span>
            ) : null}
          </div>
          <label className="portal-account__photo-upload">
            <IconCamera size={18} stroke={1.5} aria-hidden />
            <span>Change photo</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={profileImageUpload}
              disabled={isImageUploading}
            />
          </label>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="portal-packages__form">
        <section className="portal-account__card">
          <h2 className="portal-account__card-title">Personal details</h2>
          <div className="portal-packages__form-grid">
            <PortalFormField label="First name">
              <PortalFormInput
                name="first_name"
                required
                value={userDetails.first_name}
                onChange={(e) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
              />
            </PortalFormField>
            <PortalFormField label="Last name">
              <PortalFormInput
                name="last_name"
                required
                value={userDetails.last_name}
                onChange={(e) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
              />
            </PortalFormField>
          </div>
          <PortalFormField label="Phone">
            <PortalFormInput
              name="phone"
              type="tel"
              required
              value={userDetails.phone}
              onChange={(e) =>
                setUserDetails((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
          </PortalFormField>
          <button
            type="submit"
            className="portal-packages__btn-primary portal-packages__btn-primary--block"
            disabled={!isEditButtonActive || isEditLoading}
          >
            {isEditLoading ? (
              <BeatLoader color="#fff" size={8} />
            ) : (
              "Save changes"
            )}
          </button>
        </section>
      </form>

      <section className="portal-account__card">
        <h2 className="portal-account__card-title">Email</h2>
        <PortalFormField label="Email address">
          <PortalFormInput
            name="email"
            type="email"
            readOnly
            value={email.email}
          />
        </PortalFormField>
        <div className="portal-account__card-actions">
          {user?.email_verified ? (
            <p className="portal-account__verified">
              <IconCircleCheck size={18} stroke={1.5} aria-hidden />
              Email verified
            </p>
          ) : (
            <button
              type="button"
              className="portal-account__btn-secondary"
              disabled={isSendingEmailVerification}
              onClick={initializeEmailVerification}
            >
              {isSendingEmailVerification ? (
                <BeatLoader color="var(--color-dheir-blue)" size={8} />
              ) : (
                "Verify email"
              )}
            </button>
          )}
          <button
            type="button"
            className="portal-account__btn-secondary"
            disabled={isSendingEmailChangeVerification}
            onClick={initializeEmailChangeConfirmation}
          >
            {isSendingEmailChangeVerification ? (
              <BeatLoader color="var(--color-dheir-blue)" size={8} />
            ) : (
              "Change email"
            )}
          </button>
        </div>
      </section>

      <section className="portal-account__card">
        <h2 className="portal-account__card-title">Password</h2>
        <PortalFormField label="Password">
          <PortalFormInput
            name="password"
            type="password"
            readOnly
            value="••••••••"
          />
        </PortalFormField>
        <div className="portal-account__card-actions">
          <button
            type="button"
            className="portal-account__btn-secondary"
            disabled={isSendingPasswordChangeVerification}
            onClick={initializePasswordChangeConfirmation}
          >
            {isSendingPasswordChangeVerification ? (
              <BeatLoader color="var(--color-dheir-blue)" size={8} />
            ) : (
              "Change password"
            )}
          </button>
        </div>
      </section>
    </div>
  )
}
