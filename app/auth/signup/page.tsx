"use client"

import { useRouter } from 'next/navigation'
import { NextPage } from 'next'
import Link from 'next/link'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone, FaUser } from 'react-icons/fa'
import { BeatLoader, ClipLoader } from 'react-spinners'
import Image from 'next/image'
import { toast } from 'react-toastify'

const Page: NextPage = () => {
    const router = useRouter()


    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
    const [isCreatingAccount, setIsCreatingAccount] = useState(false)
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [isSendingOtp, setIsSendingOtp] = useState(false)

    const [isOTPActive, setIsOtpActive] = useState(false)

    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
        phone: "",
    })

    // Function to handle Submit
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Check for password length
        if(credentials.password.length < 7){
            toast.error("Password must be minimum 7 characters in length");
            return
        }

        // Check if confirmPassword = password
        if (credentials.password !== credentials.confirm_password){ 
            toast.error("Passwords don't match, Check Passwords")
            return
        }

        // Initiate Async process
        setIsCreatingAccount(true)
        
        const formData = new FormData(e.currentTarget)
        formData.append("role", "customer")
        formData.append("email_verified", String(isEmailVerified))
        const data = Object.fromEntries(formData)

        try{
            const res = await fetch(`/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
            router.push("/")
        }
        catch(err){
            console.error("ERR:: Unable to create user account", err)
            toast.error("ERR:: Unable to create user account")
        }
        finally{
            setIsCreatingAccount(false)
        }
    }

    // Function to handle Input Change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {

        const { name, value } = e.currentTarget
        setCredentials(prev => ({...prev, [name]: value}))
    }


    // Function to handle sending otp
    const handleSendingOtp = async () => {
        setIsSendingOtp(true)
        try{
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json", 
                },
                body: JSON.stringify({
                    email: credentials.email
                })
            })
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setIsOtpActive(true)
        }
        catch(err){
            console.error("ERR:: Could not send OTP To email", err)
            toast.error("ERR:: Could not send OTP To email")
        }
        finally{
            setIsSendingOtp(false)
        }
    }


  return <div className='w-screen h-dvh max-h-screen center-items flex center-items max-sm:overflow-hidden'>
    <div className='flex-1 bg-white h-full center-items flex-col relative'>
        <form onSubmit={handleSubmit} className='max-sm:px-10 max-sm:w-screen'>
            <div>
                <figure className='w-15 h-15 rounded-full relative mt-8'>
                    <Image 
                    src={`/d_heir_logo.png`}
                    alt='company logo'
                    fill
                    />
                </figure>
                <p className='text-xs font-semibold text-dark/60'>
                    DHEIRINTERNATIONAL
                </p>
            </div>
            <h1 className='my-2 font-bold text-2xl mt-6'>
                Sign up
            </h1>
            <div className='mt-8 space-y-4 w-fit text-xs max-sm:w-screen '>
          

                <div className='flex gap-5 max-sm:flex-col max-sm:w-70'>
                    <label className='w-full flex flex-col relative'>
                        <span className='text-dark/60'>
                            First Name
                        </span>
                        <input 
                        type="text" 
                        name="first_name" 
                        className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set'
                        value={credentials.first_name}
                        onChange={handleInputChange}
                        />
                        <FaUser className='absolute left-1 bottom-2.5 text-dark/60'/>
                    </label>
                    <label className='w-full flex flex-col relative'>
                        <span className='text-dark/60'>
                            Last Name
                        </span>
                        <input 
                        type="text" 
                        name="last_name" 
                        className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set'
                        value={credentials.last_name}
                        onChange={handleInputChange}
                        />
                        <FaUser className='absolute left-1 bottom-2.5 text-dark/60'/>
                    </label>
                </div>

                <div className='flex gap-5 max-sm:flex-col max-sm:w-70'>
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
                        {
                            credentials.email.length > 0 && credentials.email.includes("@gmail.com") &&
                            <button 
                            className='absolute right-0 bottom-1.5 text-yellow-500'
                            type='button'
                            disabled={isSendingOtp || isEmailVerified}
                            onClick={handleSendingOtp}
                            >
                                {
                                    isEmailVerified ? 
                                    <FaCheck className='text-green-400'/> :
                                    isSendingOtp ?
                                    <ClipLoader color='orange' size={10}/> :
                                    "Verify"
                                }
                            </button>
                        }
                    </label>
                    <label className='w-full flex flex-col relative'>
                        <span className='text-dark/60'>
                            Phone Number
                        </span>
                        <input 
                        type="text" 
                        name="phone" 
                        className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set'
                        value={credentials.phone}
                        onChange={handleInputChange}
                        />
                        <FaPhone className='absolute left-1 bottom-2.5 text-dark/60'/>
                    </label>
                </div>

                <div className='flex gap-5 max-sm:flex-col max-sm:w-70'>
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
                            className='right-1 absolute bottom-2 rounded-full p-2'
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
                    <label className='w-full flex flex-col relative'>
                        <span className='text-dark/60'>
                            Confirm Password
                        </span>
                        <input 
                        type={isConfirmPasswordVisible ? "text" : "password"} 
                        name="confirm_password" 
                        className='border-b border-dark/10 p-2 pl-7 pr-6 outline-0 focus:border-dark transition-set'
                        value={credentials.confirm_password}
                        onChange={handleInputChange}
                        />
                        <FaLock className='absolute left-1 bottom-2.5 text-dark/60'/>
                        <button 
                            className='right-1 absolute bottom-2 rounded-full p-2'
                            type="button"
                            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        >
                            {
                                isConfirmPasswordVisible ?
                                <FaEyeSlash/> : 
                                <FaEye />
                            }
                        </button>
                    </label>
                </div> 
                
            </div>
            <div className='w-full'>
                <button className='w-full bg-accent-blue text-white text-xs mt-6 py-3 rounded'>
                    {
                        isCreatingAccount ?
                        <BeatLoader color='#fff' size={8}/> :
                        <>
                            Create Account
                        </>
                    }
                </button>
            </div>
        </form>
        <div className='flex gap-1 text-xs mt-3 pb-10'>
            <p className='opacity-40'>
                Have an account?
            </p>
            <Link href={"/auth/login"}>
                Log in
            </Link>
        </div> 


        {/* OTP Component*/}

        {
            isOTPActive && <OTPComponent {...{credentials, setIsOtpActive, setIsEmailVerified}}/>
            
        }

    </div>

    
    <div className='flex-1 h-full max-sm:hidden'>
        
    </div>

  </div>
}


const OTPComponent = ({credentials, setIsOtpActive, setIsEmailVerified}) => {

    const [countDown, setCountDown] = useState(59)
    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [otp, setOtp] = useState("")

    // Handle countdown till resend otp available
    useEffect(() => {
        
        const intervalID = setInterval(() => {
            if(countDown > 0){
                setCountDown(prev => prev - 1)
            }
        }, 1000)

        return () => clearInterval(intervalID)
        
    }, [countDown])


    // Function to handle sending otp
    const handleSendingOtp = async () => {
        setIsSendingOtp(true)
        try{
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json", 
                },
                body: JSON.stringify({
                    email: credentials.email
                })
            })
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("OTP Sent")
            setCountDown(59)
        }
        catch(err){
            console.error("ERR:: Could not send OTP To email", err)
            toast.error("ERR:: Could not send OTP To email")
        }
        finally{
            setIsSendingOtp(false)
        }
    }

    const handleSubmit = async () => {
        setIsVerifyingEmail(true)
        try{
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json" 
                },
                body: JSON.stringify({
                    otp: Number(otp),
                    email: credentials.email
                })
            })
            const result = await res.json()

            if (!res.ok){
                toast.error(result.message)
                return
            }

            // todo: Put verified message here
            toast.success("Succesfully verified email")
            setIsOtpActive(false)
            setIsEmailVerified(true)
        }
        catch(err){
            toast.error("ERR:: Could not verify Email")
            console.error("ERR:: Could not verify Email", err)
        }
        finally{
            setIsVerifyingEmail(false)
        }
    }



    return <div className='absolute w-full h-full bg-black/40'>
        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 p-8 rounded-t-2xl bg-light h-70 w-100 center-items flex-col'>
            <div className='w-70'>
                <h2 className='font-bold'>
                    Verify OTP
                </h2>
                <p className='text-[10px] text-dark/50 my-2'> 
                    We sent an OTP to {credentials.email} <br />
                    Enter it below to continue
                </p>
                <input 
                type="text" 
                className='border border-dark/20 rounded w-[90%] text-xs outline-0 p-2'
                value={otp}
                onChange={(e) => {setOtp(e.currentTarget.value)}}
                />
                <div className='mt-3 text-[10px] flex gap-1'>
                    <span>Resend Available 
                        {   
                            countDown > 0 &&
                            <><span>in</span> <span className='text-accent-red'>{countDown}</span> <span>seconds</span></>
                        }
                    :</span>
                    <button 
                    className='text-accent-red font-semibold'
                    onClick={() => {
                        if(countDown > 0){
                            toast.info("Please wait before requesting another OTP")
                        }
                        else
                        handleSendingOtp()
                    }}
                    >
                        {
                            isSendingOtp ? <ClipLoader color='orange' size={5}/> :
                            "Resend OTP"
                        }
                    </button>
                </div>
                <button 
                className='text-xs bg-accent-blue w-full py-2 rounded text-white mt-2'
                disabled={isVerifyingEmail}
                onClick={handleSubmit}
                >
                    {
                        isVerifyingEmail ?
                        <ClipLoader size={12} color='white'/> :
                        "Verify"
                    }
                </button>
            </div>
        </div>
    </div>
}




export default Page