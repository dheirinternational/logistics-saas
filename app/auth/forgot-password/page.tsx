"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function Page(){
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Forgotpassword />
        </Suspense>
    )
}


function Forgotpassword(){

    
    const router = useRouter() 
    const searchParams = useSearchParams()

    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [password, setPassword] = useState("")

    const changePassword = async () => {
        setIsChangingPassword(true)

        const token = searchParams.get("token")

        try {
            const res = await fetch(`/api/auth/forgot-password`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json" 
                },
                body: JSON.stringify(
                    {
                        password,
                        token
                    }
                )
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
        <div className="w-screen h-dvh center-items">
            <form 
            className="bg-light p-body rounded shadow flex flex-col gap-3">
                
                <input 
                type="text" 
                className="text-xs border border-dark/20 outline-0 rounded w-50 px-2 py-2"
                required
                name="password"
                placeholder="Input New Password..."
                value={password}
                onChange={(e) => {setPassword(e.currentTarget.value)}}
                />
                
                <button 
                type="button"
                disabled={isChangingPassword}
                onClick={changePassword}
                className="bg-accent-red text-white text-xs py-2 rounded">
                    {
                        isChangingPassword ?
                        <BeatLoader color="white" size={10}/> :
                        "Change Password"
                    }
                </button>

            </form>
        </div>
    )
}