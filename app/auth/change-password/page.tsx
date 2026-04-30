"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, Suspense, useState } from "react"
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa"
import { BeatLoader, ClipLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function Page(){
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <ChangePassword />
        </Suspense>
    )
}

function ChangePassword(){

    const searchParams = useSearchParams()
    const router = useRouter() 

    const [password, setPassword] = useState("")
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const [confirmPassword, setConfirmPassword] = useState("")
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)


    const changePassword = async () => {
        setIsChangingPassword(true)
        const token = searchParams.get("token")
        const email = searchParams.get("email")

        if(password.length < 7){
            toast.error("Password cannot be less than 7 Characters")
            setIsChangingPassword(false)
            return    
        }

        if(!password.trim() || !confirmPassword.trim()){
            toast.error("Fill all fields")
            setIsChangingPassword(false)
            return
        }

        if(password !== confirmPassword){
            toast.error("Passwords don't match, check input")
            setIsChangingPassword(false)
            return
        }


        if (!token || !email) {
            toast.error("Invalid or broken reset link")
            setIsChangingPassword(false)
            return
        }

        try {
            const res = await fetch(`/api/auth/forgot-password-change?token=${token}&email=${email}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json" 
                },
                body: JSON.stringify({
                    password
                })
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
            toast.info("Redirecting...")
            router.push("/auth/login")
            
        } catch(err){
            toast.error("ERR:: Changing User Password")
            console.error("ERR:: Changing User Password", err)
        }
        finally{
            setIsChangingPassword(false)
        }
    }




    return(
        <div className="w-screen h-dvh center-items flex max-sm:flex-col">
            <div className="flex-1 bg-light h-full center-items max-sm:h-dvh max-sm:w-full">
                <div className="">
                    <h1 className="font-semibold text-xl">
                        Input New Password
                    </h1>
                    <div 
                    className="rounded flex flex-col gap-3 text-[10px] mt-8">
                        
                        <label className='flex flex-col relative w-70'>
                            <span className='text-dark/60'>
                                Password
                            </span>
                            <input 
                            type={isPasswordVisible ? "text" : "password"} 
                            name="password" 
                            className='border-b border-dark/10 p-2 pl-7 pr-6 outline-0 focus:border-dark transition-set'
                            value={password}
                            onChange={(e) => {setPassword(e.currentTarget.value)}}
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

                        <label className='flex flex-col relative w-70'>
                            <span className='text-dark/60'>
                                Confirm Password
                            </span>
                            <input 
                            type={isConfirmPasswordVisible ? "text" : "password"} 
                            name="change_password" 
                            className='border-b border-dark/10 p-2 pl-7 pr-6 outline-0 focus:border-dark transition-set'
                            value={confirmPassword}
                            onChange={(e) => {setConfirmPassword(e.currentTarget.value)}}
                            />
                            <FaLock className='absolute left-1 bottom-2.5 text-dark/60'/>
                            <button 
                                className='right-1 absolute bottom-0.5 rounded-full p-2'
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

                        
                        <button 
                        disabled={isChangingPassword || !password || !confirmPassword}
                        className="bg-accent-red text-white text-xs py-2 rounded"
                        onClick={changePassword}
                        >
                            {
                                isChangingPassword ?
                                <ClipLoader color="white" size={10}/> :
                                "Change Password"
                            }
                        </button>

                    </div>
                </div>
            </div>

            <div className="flex-1 max-sm:hidden">

            </div>
        </div>
    )
}