"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { useRouter } from 'next/navigation'
import { NextPage } from 'next'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { BeatLoader } from 'react-spinners'
import Image from 'next/image'

const Page: NextPage = () => {
    const router = useRouter()

    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSendingPasswordChangeVerification, setIsSendingPasswordChangeVerification] = useState(false)
    const [page, setPage] = useState<"login" | "forgot-password">("login")

    const [changePasswordEmail, setChangePasswordEmail] = useState("")

    useEffect(()=>{
        handleSession()
    }, [])

    const handleSession = async() => {
        try{
            const res = await fetch("/api/auth/me", {
                method: "GET",
                credentials: "include"
            })
            const data = await res.json()            
            if(data.user?.role){
                if (data.user.role === "customer"){
                    router.push("/base")
                } else if (data.user.role === "admin"){
                    router.push("/admin")
                }
            }

        }
        catch(err){
            console.log(err)
        }
    }

    const initializePasswordChangeConfirmation = async () => {
        setIsSendingPasswordChangeVerification(true)
        try{
            const res = await fetch(`/api/auth/forgot-password/initialize`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include",
                body: JSON.stringify({email: changePasswordEmail})
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setPage("login")
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        try{
            const res = await fetch("/api/auth/login", {
                method: "POST",
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

            toast.success("Succesfully logged In")

            await handleSession()
        }
        catch(err){
            toast.error("An error occurred. Please try again.")
            console.error(err)
        }
        finally{
            setIsLoading(false)
        }
    } 


    const handleSubmitForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSendingPasswordChangeVerification(true)
        
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)
        console.log(data.email)

        try{
            
        }
        catch(err){
            toast.error("ERR:: Sending Verification Link to Email")
            console.error("ERR:: Sending Verification Link to Email", err)
        }
        finally{
            setIsSendingPasswordChangeVerification(false)
        }
    }


  return <div className='w-screen h-dvh max-h-screen center-items'>
    {   
        page === "login" ?
        <div className=''>
            <div className=''>
                <figure className='relative h-20 w-20 '>
                    <Image 
                    src={"/d_heir_logo.png"}
                    alt='company logo'
                    fill
                    />
                </figure>

                <p className='text-xs font-semibold'>
                    D_Heir International
                </p>
            </div>
            <h1 className='my-2 font-bold text-2xl'>
                Log in
            </h1>
            <form 
            className='mt-8 space-y-4'
            onSubmit={handleSubmit}
            >
                <div className='w-70'>
                    <InputComponent 
                    title='Email Address'
                    name='email'
                    type='email'
                    state={credentials}
                    setState={setCredentials}
                    />
                </div>
                <div className='w-70'>
                    <InputComponent 
                    title='Password'
                    name='password'
                    type='password'
                    state={credentials}
                    setState={setCredentials}
                    />
                </div>
                <div>
                    <button className='w-full bg-accent-blue text-white mt-6 py-2 rounded text-sm'>
                        {isLoading ? <BeatLoader color='#FFF' size={10} /> : "Log in"}
                    </button>
                </div>
            </form>
            <div className='flex gap-1 text-xs mt-3'>
                <p className='opacity-40'>
                    {"Don't"} Have an account?
                </p>
                <Link href={"/auth/signup"}>
                    Sign Up
                </Link>
            </div> 
            <button 
            className={`
                text-xs flex gap-2 items-center underline
            `}
            onClick={() => {setPage("forgot-password")}}
            >
                Forgot password
            </button>
        </div> :
        // Forgot passwords
        <div className='bg-light rounded p-body shadow w-70 space-y-3'>
            <h1 className='text-sm font-semibold'>
                Input Email
            </h1>
            <form onSubmit={handleSubmitForgotPassword}
            className='space-y-3'
            >
                <input 
                type="email"
                name='email' 
                className='outline-0 border border-dark/20 rounded w-full text-xs px-3 py-2'
                value={changePasswordEmail}
                onChange={(e) => {setChangePasswordEmail(e.currentTarget.value)}}
                required
                />

                <button 
                disabled={isSendingPasswordChangeVerification}
                className='bg-accent-blue text-white text-[10px] py-2 w-full rounded'
                onClick={() => {initializePasswordChangeConfirmation()}}
                >
                    {
                        isSendingPasswordChangeVerification ?
                        <BeatLoader color='white' size={10}/> :
                        "Send Link"
                    }
                </button>

                <button 
                className='bg-accent-red text-white text-[10px] py-2 w-full rounded'
                disabled={isSendingPasswordChangeVerification}
                onClick={() => {setPage("login")}}
                >
                    Go Back
                </button>
            </form>
        </div>
    }
  </div>
}

export default Page