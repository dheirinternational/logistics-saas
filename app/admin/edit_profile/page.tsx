"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { User } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { FaCheckCircle, FaUser } from 'react-icons/fa'
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import { IconCamera, IconMail, IconShieldLock, IconUserCircle } from "@tabler/icons-react"


type BasicDetails = Omit<User, "id" | "password" | "role" | "created_at" | "email" | "profile_img">
interface UserWithVerified extends User {
    email_verified: boolean
}

const Page: NextPage = () => {

    const [isEditButtonActive, setIsEditButtonActive] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditLoading, setIsEditLoading] = useState(false)
    const [isSendingEmailVerification, setIsSendingEmailVerification] = useState(false)
    const [isSendingEmailChangeVerification, setSendingEmailChangeVerification] = useState(false)
    const [isSendingPasswordChangeVerification, setIsSendingPasswordChangeVerification] = useState(false)
    const [isImageUploading, setIsImageUploading] = useState(false)
    const [user, setUser] = useState<null | UserWithVerified>(null)
    const [image, setImage] = useState<string | null>(null)



    const [userDetails, setUserDetails] = useState<BasicDetails>({ first_name: "", last_name: "", phone: "" })

    const [email, setEmail] = useState({ email: "" })

    const [password, setPassword] = useState({ password: "" })

    // Fetch User Related Data  
    const fetchData = async () => {
        try{
            const res = await fetch("/api/users/my-data/admin", {
                method: "GET",
                credentials: "include",
                cache: "no-cache"
            })

            if(!res.ok){
                throw new Error("Failed to fetch User")
            }

            const data = await res.json()
            const fetchedUser = data.data
            setUser(fetchedUser)
            setUserDetails({
                first_name: fetchedUser.first_name,
                last_name: fetchedUser.last_name,
                phone: fetchedUser.phone
            })

            setEmail({email: fetchedUser.email})
        }
        catch(err){
            toast.error("ERR:: Fetching User Details")
            console.error("ERR:: Fetching User Details", err)
        }
        finally{
            setIsLoading(false)
        }
    }

   const profileImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        
        setIsImageUploading(true)
        const file = e.target.files?.[0]
        if (!file) return
        
        try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload-user-image', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        })

        const data = await res.json()

        if (!data.success) {
            toast.error(data.message ?? 'Error uploading image')
            return
        }

        setImage(data.imageUrl)  // instant UI update
        router.refresh()         // re-fetch server components
        toast.success('Profile image updated!')

        } catch (err) {
        console.error('Upload error:', err)
        toast.error('Something went wrong uploading your image')
        }finally {
            setIsImageUploading(false)
        }
    }

     // Initialize email Verification
    const initializeEmailVerification = async () => {
        setIsSendingEmailVerification(true)

        try{
            const res = await fetch("/api/auth/verify-email-initialization")
            const result = await res.json()
            
            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Email Verification Link Sent to your email")
        }
        catch(err){
            toast.error("ERR:: Initializing Verification")
            console.error("ERR:: Initializing Verification", err)
        }
        finally{
            setIsSendingEmailVerification(false)
        }
    }

    // Send Email Change Confirmation link to email
    const initializeEmailChangeConfirmation = async () => {
        setSendingEmailChangeVerification(true)
        try{
            const res = await fetch(`/api/auth/change-email/initialize-change`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
        }
        catch(err){ 
            toast.error("ERR:: Sending Email Change Confirmation, try again")
            console.error("ERR:: Sending Email Change Confirmation", err)
        }
        finally{
            setSendingEmailChangeVerification(false)
        }
    }

     // Send Password Change Confirmation link to email
    const initializePasswordChangeConfirmation = async () => {
        setIsSendingPasswordChangeVerification(true)
        try{
            const res = await fetch(`/api/auth/change-password/initialize-change`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
        }
        catch(err){ 
            toast.error("ERR:: Sending Password Change Confirmation, try again")
            console.error("ERR:: Sending Password Change Confirmation", err)
        }
        finally{
            setIsSendingPasswordChangeVerification(false)
        }
    }


    // Effect for fetching data
    useEffect(() => {
        fetchData()
    }, [])

    // Set Profile Edit State
    useEffect(() => {
        if (!user) return

        if (
            userDetails.first_name !== user.first_name ||
            userDetails.last_name !== user.last_name ||
            userDetails.phone !== user.phone
        ) {
            setIsEditButtonActive(true)
        } 
        else {
            setIsEditButtonActive(false)
        }

    }, [user, userDetails])


    const router = useRouter()


    // Change user details
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIsEditLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        try{
            const res = await fetch("/api/users/my-data", {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.error)
                return
            }

            if(result.success){
                toast.success("Profile successfully updated")
                router.refresh()
                setIsEditButtonActive(false)
            }
        }
        catch(err){
            toast.error(err instanceof Error ? err.message : "Something went wrong")
        }
        finally{
            setIsEditLoading(false)
        }
    }


  return (
    <div className="portal-home">
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Admin</p>
          <h1 className="portal-home__greeting-title">Edit profile</h1>
          <p className="portal-home__greeting-sub">Make edits to your user information.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="portal-home__panel portal-home__loader">
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : (
        <>
        {/* <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between md:max-w-125 md:mx-auto'>
            <button 
            className='flex gap-2 flex-1 justify-start'
            onClick={() => {router.back()}}
            >
                <FaChevronLeft />
                <span className='text-xs font-semibold'>
                    Go Back
                </span>
            </button>
            <h1 className='font-semibold text-xs'>
                Edit profile
            </h1>
            <Link href={"/base/profile"} className='flex-1 flex justify-end'>
                <FaUser />
            </Link>
        </div> */}
          <section className="portal-home__panel" aria-label="Profile photo">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Profile photo</h2>
                <p className="portal-home__section-sub">Update your avatar for the admin portal.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: 92, height: 92 }}>
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 999,
                    border: "1px solid var(--color-dheir-border)",
                    background: "var(--color-dheir-page)",
                    position: "relative",
                    overflow: "hidden",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {(image || user?.profile_img) ? (
                    <Image
                      src={image ?? user?.profile_img ?? ""}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="92px"
                      priority
                    />
                  ) : (
                    <IconUserCircle size={44} stroke={1.25} aria-hidden />
                  )}

                  {isImageUploading ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        background: "color-mix(in srgb, #fff 65%, transparent)",
                      }}
                    >
                      <DheirLoader color="var(--color-dheir-blue)" size={12} />
                    </div>
                  ) : null}
                </div>

                <label
                  style={{
                    position: "absolute",
                    right: -6,
                    bottom: -6,
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    border: "1px solid var(--color-dheir-border)",
                    background: "var(--color-dheir-surface)",
                    display: "grid",
                    placeItems: "center",
                    cursor: isImageUploading ? "not-allowed" : "pointer",
                  }}
                  aria-label="Upload new profile photo"
                >
                  <IconCamera size={18} stroke={1.5} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={profileImageUpload}
                    disabled={isImageUploading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="portal-home__panel" aria-label="Basic details">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Basic details</h2>
                <p className="portal-home__section-sub">Update your name and phone number.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__form" style={{ gridTemplateColumns: "1fr" }}>
              <div className="admin-modal__fields" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <InputComponent
                  name="first_name"
                  state={userDetails}
                  setState={setUserDetails}
                  title="First name"
                  type="text"
                />
                <InputComponent
                  name="last_name"
                  state={userDetails}
                  setState={setUserDetails}
                  title="Last name"
                  type="text"
                />
                <div style={{ gridColumn: "1 / -1" }}>
                  <InputComponent
                    name="phone"
                    state={userDetails}
                    setState={setUserDetails}
                    title="Phone"
                    type="text"
                  />
                </div>
              </div>

              <div className="admin-modal__actions">
                <button
                  className="portal-home__btn portal-home__btn--primary"
                  disabled={!isEditButtonActive || isEditLoading}
                  type="submit"
                >
                  {isEditLoading ? <DheirLoader color="#fff" size={10} /> : "Save changes"}
                </button>
              </div>
            </form>
          </section>

          <section className="portal-home__panel" aria-label="Security">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Security</h2>
                <p className="portal-home__section-sub">Manage email verification and password resets.</p>
              </div>
            </div>

            <div className="admin-modal__form" style={{ gridTemplateColumns: "1fr" }}>
              <div className="admin-modal__fields" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <InputComponent
                    name="email"
                    state={email}
                    setState={setEmail}
                    title="Email"
                    type="email"
                    readonly
                  />
                </div>

                <button
                  type="button"
                  className="portal-home__btn portal-home__btn--secondary"
                  disabled={isSendingEmailChangeVerification}
                  onClick={initializeEmailChangeConfirmation}
                  style={{ justifySelf: "start" }}
                >
                  {isSendingEmailChangeVerification ? <DheirLoader color="var(--color-dheir-blue)" size={10} /> : (
                    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                      <IconMail size={16} stroke={1.5} />
                      Change email
                    </span>
                  )}
                </button>

                {!user?.email_verified ? (
                  <button
                    type="button"
                    className="portal-home__btn portal-home__btn--secondary"
                    disabled={isSendingEmailVerification}
                    onClick={initializeEmailVerification}
                    style={{ justifySelf: "start" }}
                  >
                    {isSendingEmailVerification ? <DheirLoader color="var(--color-dheir-blue)" size={10} /> : "Verify email"}
                  </button>
                ) : (
                  <p className="portal-home__section-sub" style={{ margin: 0, display: "flex", gap: 8, alignItems: "center" }}>
                    Email verified <FaCheckCircle className="text-green-300 text-[12px]" />
                  </p>
                )}

                <div style={{ gridColumn: "1 / -1" }}>
                  <InputComponent
                    name="password"
                    state={password}
                    setState={setPassword}
                    title="Password"
                    type="password"
                    readonly
                  />
                </div>

                <button
                  type="button"
                  className="portal-home__btn portal-home__btn--secondary"
                  disabled={isSendingPasswordChangeVerification}
                  onClick={initializePasswordChangeConfirmation}
                  style={{ justifySelf: "start" }}
                >
                  {isSendingPasswordChangeVerification ? <DheirLoader color="var(--color-dheir-blue)" size={10} /> : (
                    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                      <IconShieldLock size={16} stroke={1.5} />
                      Change password
                    </span>
                  )}
                </button>
              </div>
            </div>
          </section>

        {/* <div className='bg-light p-body mt-2 flex justify-between items-center md:max-w-125 md:mx-auto pb-26'>
            <p className='text-red-500 text-xs'>
                Delete my Account
            </p>
            <button className='text-[10px] px-4 py-2 bg-dark/20 rounded h-fit'>
                Delete Account
            </button>
        </div> */}
        </>
      )}
    </div>
  )
}

export default Page