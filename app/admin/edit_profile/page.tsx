"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { User } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { FaCamera, FaCheckCircle, FaChevronLeft, FaUser } from 'react-icons/fa'
import { BeatLoader, ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'


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
            const res = await fetch("/api/users/my-data", {
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
            toast.error("ERR:: Uploading User Details")
            console.error("ERR:: Uploading User Details", err)
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


  return <div className='h-full w-full'>
    {
    isLoading ? 
    <div className='flex h-full w-full center-items md:max-w-125 md:mx-auto'>
        <BeatLoader color='#f26430' size={15} speedMultiplier={0.5}/>
    </div> :
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

        <div className='p-body bg-light mt-2 text-sm space-y-4 md:max-w-125 md:mx-auto'>
            <div className='relative w-fit h-fit mx-auto space-y-2'>
                <figure className='w-31 h-31 bg-red-300 rounded-full mx-auto relative overflow-hidden'>
                    {
                        (image || user?.profile_img) ?
                        <Image
                        src={image ?? user?.profile_img ?? ""}
                        alt='User Profile'
                        fill
                        className='object-cover'
                        loading='eager'
                        /> :
                        <div className='bg-white/50 absolute top-0 left-0 w-full h-full border rounded-full center-items border-dark/20'>
                            <FaUser className='text-4xl'/>
                        </div>
                    }
                    {
                        isImageUploading && 
                        <div className='bg-white/50 absolute top-0 left-0 w-full h-full border rounded-full center-items border-dark/20'>
                            <ClipLoader speedMultiplier={0.5}/>
                        </div>
                    }
                </figure>
                <div className='h-10 w-10 absolute bg-dark/60 rounded-full bottom-0 right-0 flex center-items' > 
                    <FaCamera className='text-secondary-text'/>
                    <input 
                    type="file"
                    accept='image/*'
                    className='absolute w-full h-full bg-white rounded-full opacity-0' 
                    onChange={ e => {profileImageUpload(e)}}
                    disabled={isImageUploading}
                    />
                </div>
            </div>

            {/* Details */}
            <form className='w-full px-4 mt-4 space-y-2 md:max-w-125 md:mx-auto' onSubmit={handleSubmit}>
                <div className='flex gap-2'>
                    <InputComponent 
                    name='first_name'
                    state={userDetails}
                    setState={setUserDetails}
                    title='First Name'
                    type='text'
                    />

                    <InputComponent 
                    name='last_name'
                    state={userDetails}
                    setState={setUserDetails}
                    title='Last Name'
                    type='text'
                    />
                </div>
                <div className='flex gap-2 items-end'>
                    <InputComponent 
                    name='phone'
                    state={userDetails}
                    setState={setUserDetails}
                    title='Phone'
                    type='text'
                    />

                    <button className='w-full bg-accent-red text-white py-2 h-10 rounded disabled:opacity-10'
                    disabled={!isEditButtonActive || isEditLoading}
                    >
                        {isEditLoading ? <BeatLoader color='#fff' size={15}/> : "Edit Profile"}
                    </button>
                </div>
            </form>

        </div>

        <div className='bg-light p-body mt-2 space-y-3 md:max-w-125 md:mx-auto'>
            <div className='flex justify-between items-end'>
                <div className='w-50'>
                    <InputComponent 
                    name='email'
                    state={email}
                    setState={setEmail}
                    title='Email'
                    type='email'
                    readonly
                    />
                </div>

                <div className='space-x-2'>

                 

                    <button 
                    className='text-[9px] px-3 py-2 bg-dark/20 rounded h-fit'
                    disabled={isSendingEmailChangeVerification}
                    onClick={() => {
                      initializeEmailChangeConfirmation()
                    }}
                    >
                        {
                            isSendingEmailChangeVerification ?
                            <BeatLoader color='orange' size={10}/> :
                            "Change Email"
                        }
                    </button>

                </div>
            </div>



            {/* Verify Email Button */}

            {
                !user?.email_verified ?
                <button
                disabled={isSendingEmailVerification} 
                className={`
                    text-[10px] px-4 py-2 rounded h-fit border border-dark/20
                    
                `}
                onClick={() => {
                    initializeEmailVerification()
                }}
                >
                    {
                        isSendingEmailVerification ?
                        <BeatLoader color='orange' size={10}/> :
                        "Verify Email"
                    }
                </button> :
                <p className='text-[10px] flex gap-1 items-center'>
                    Email Verified
                    <FaCheckCircle className='text-green-300 text-[10px]'/>
                </p>
            }

            <div className='flex justify-between items-end'>
                <div className='w-50'>
                    <InputComponent 
                    name='password'
                    state={password}
                    setState={setPassword}
                    title='Password'
                    type='password'
                    readonly
                    />
                </div>

                <button 
                className='text-[10px] px-4 py-2 bg-dark/20 rounded h-fit'
                disabled={isSendingPasswordChangeVerification}
                onClick={initializePasswordChangeConfirmation}
                >
                    {
                        isSendingPasswordChangeVerification ? 
                        <BeatLoader color='orange' size={10}/> :
                        "Change Password"
                    }
                </button>
            </div>
        </div>

        {/* <div className='bg-light p-body mt-2 flex justify-between items-center md:max-w-125 md:mx-auto pb-26'>
            <p className='text-red-500 text-xs'>
                Delete my Account
            </p>
            <button className='text-[10px] px-4 py-2 bg-dark/20 rounded h-fit'>
                Delete Account
            </button>
        </div> */}
    </>}
  </div>
}

export default Page