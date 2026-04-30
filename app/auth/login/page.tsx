"use client"

import { useRouter } from 'next/navigation'
import { NextPage } from 'next'
import Link from 'next/link'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { BeatLoader, ClipLoader } from 'react-spinners'
import Image from 'next/image'
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa'

const Page: NextPage = () => {
    const router = useRouter()

    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    // const [isSendingPasswordChangeVerification, setIsSendingPasswordChangeVerification] = useState(false)
    const [page, setPage] = useState<"login" | "forgot-password">("login")
    const [changePasswordEmail, setChangePasswordEmail] = useState("")
    const [isSendingPasswordEmail, setIsSendingPasswordEmail] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)


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

    // const initializePasswordChangeConfirmation = async () => {
    //     setIsSendingPasswordChangeVerification(true)
    //     try{
    //         const res = await fetch(`/api/auth/forgot-password/initialize`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type" : "application/json"
    //             },
    //             credentials: "include",
    //             body: JSON.stringify({email: changePasswordEmail})
    //         })

    //         const result = await res.json()

    //         if(!res.ok){
    //             toast.error(result.message)
    //             return
    //         }

    //         setPage("login")
    //         toast.success(result.message)
    //     }
    //     catch(err){ 
    //         toast.error("ERR:: Sending Password Change Confirmation, try again")
    //         console.error("ERR:: Sending Password Change Confirmation", err)
    //     }
    //     finally{
    //         setIsSendingPasswordChangeVerification(false)
    //     }
    // }


    // Function to send Password Change page link
    const handlePasswordChangeLink = async () => {
        setIsSendingPasswordEmail(true)
        try{
            const res = await fetch(`/api/auth/send-change-password-link`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    email: changePasswordEmail
                })
            })
            const result = await res.json()

            if(!res.ok){
                toast.success(result.message)
                return
            }

            toast.success(result.message)
            

        }
        catch(err){
            console.error("ERR:: Network Error", err)
            toast.error("ERR:: Network Error")
        }
        finally{
            setIsSendingPasswordEmail(false)
        }
    }


    // Function to handle Log In
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



    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {

        const { name, value } = e.currentTarget
        setCredentials(prev => ({...prev, [name]: value}))
    }


  return <div className='w-screen h-dvh max-h-screen center-items flex max-sm:flex-col'>

        <div className='flex-1 bg-light h-full max-sm:w-screen max-sm:h-dvh'>
            <div className='center-items flex-col h-full'>
                <div className={`
                    h-110 w-70 max-w-70 overflow-x-hidden
                `}>
                    {/* Scroll Bar */}
                    <div className={`
                        w-fit flex transition-set
                        ${page === "login" ? "translate-x-0" : "-translate-x-1/2"}
                    `}>

                        {/* LOGIN FORM */}
                        <div>
                            <div className=''>
                                <figure className='relative h-20 w-20 '>
                                    <Image 
                                    src={"/d_heir_logo.png"}
                                    alt='company logo'
                                    fill
                                    />
                                </figure>

                                <p className='text-xs text-dark/50 font-semibold'>
                                    DHEIRINTERNATIONAL
                                </p>
                            </div>
                            <h1 className='my-2 font-bold text-2xl mt-8'>
                                Log in
                            </h1>
                            <form 
                            className='mt-8 space-y-4'
                            onSubmit={handleSubmit}
                            >
                                <div className='text-[10px] space-y-4 w-70'>
                                    <label className='w-full flex flex-col relative'>
                                        <span className='text-dark/60'>
                                            Email Address
                                        </span>
                                        <input 
                                        type="email" 
                                        name="email" 
                                        className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                                        value={credentials.email}
                                        onChange={handleInputChange}
                                        />
                                        <FaEnvelope className='absolute left-1 bottom-2.5 text-dark/60'/>
                                    </label>
                                    <label className='w-full flex flex-col relative'>
                                        <span className='text-dark/60'>
                                            Password
                                        </span>
                                        <input 
                                        type={isPasswordVisible ? "text" : "password"} 
                                        name="password" 
                                        className='border-b border-dark/10 p-2 pl-7 pr-6 outline-0 focus:border-dark transition-set'
                                        value={credentials.password}
                                        onChange={handleInputChange}
                                        />
                                        <FaLock className='absolute left-1 bottom-2.5 text-dark/60'/>
                                        <button 
                                            className='right-1 absolute bottom-0.5 rounded-full p-2'
                                            type="button"
                                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                        >
                                            {
                                                isPasswordVisible ?
                                                <FaEyeSlash/> : 
                                                <FaEye />
                                            }
                                        </button>
                                    </label>
                                </div>




                                <div>
                                    <button className='w-full bg-accent-blue text-white mt-6 py-2 rounded text-xs'>
                                        {isLoading ? <ClipLoader color='#FFF' size={8} /> : "Log in"}
                                    </button>
                                </div>
                            </form>
                            <div className='flex gap-1 text-[10px] mt-8 mb-1'>
                                <p className='opacity-40'>
                                    {"Don't"} Have an account?
                                </p>
                                <Link href={"/auth/signup"}>
                                    Sign Up
                                </Link>
                            </div> 
                            <button 
                            className={`
                                text-[10px] flex gap-2 items-center underline text-red-500
                            `}
                            onClick={() => {setPage("forgot-password")}}
                            >
                                Forgot password
                            </button>
                        </div>






                        {/* FORGOT PASSWORD */}
                            
                        <div className='w-70 h-110 center-items'>
                            <div>
                                <h2 className='font-semibold text-xl'>
                                    Forgot Password
                                </h2>
                                <p className='text-[10px] mt-4 text-dark/60'>
                                    Forgotten your password? Input your account email below. A redirection link to change your email will be sent to your email
                                </p>

                                <div className='mt-8'>
                                    <label className='w-full flex flex-col relative text-[10px]'>
                                        <span className='text-dark/60'>
                                            Email Address
                                        </span>
                                        <input 
                                        type="text" 
                                        name="change_password" 
                                        className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                                        value={changePasswordEmail}
                                        onChange={(e) => {setChangePasswordEmail(e.currentTarget.value)}}
                                        />
                                        <FaEnvelope className='absolute left-1 bottom-2.5 text-dark/60'/>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button 
                                    className='bg-accent-blue w-full text-[10px] text-white py-2 rounded mt-4'
                                    disabled={isSendingPasswordEmail}
                                    onClick={handlePasswordChangeLink}
                                    >
                                        {
                                            isSendingPasswordEmail ? 
                                            <ClipLoader size={12} color='white'/> :
                                            "Send Link"
                                        }
                                    </button>
                                </div>

                                <div>
                                    <button 
                                    className='text-[10px] underline mt-6'
                                    onClick={() => {setPage("login")}}
                                    >
                                        Go back
                                    </button>
                                </div>

                            </div>
                        </div>
                            
                    </div>
                    
                </div>    
            </div> 
        </div>


        
        <div className='flex-1 max-sm:hidden'>

        </div>

    
  </div>
}

export default Page