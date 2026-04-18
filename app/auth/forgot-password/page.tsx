"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function Page({ searchParams }: any){

    const params = searchParams
    const router = useRouter() 

    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [email, setEmail] = useState("")

    const changePassword = async (newPassword: string) => {
        setIsChangingPassword(true)
        const token = params.get("token")
        try {
            const res = await fetch(`/api/auth/change-password/forgot-password?token=${token}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json" 
                },
                body: JSON.stringify({newPassword})
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        changePassword(data.password as string)
    }


    return(
        <div className="w-screen h-dvh center-items">
            <form 
            onSubmit={handleSubmit}
            className="bg-light p-body rounded shadow flex flex-col gap-3">
                
                <input 
                type="text" 
                className="text-xs border border-dark/20 outline-0 rounded w-50 px-2 py-2"
                required
                name="password"
                placeholder="Input New Password..."
                value={email}
                onChange={(e) => {setEmail(e.currentTarget.value)}}
                />
                
                <button 
                disabled={isChangingPassword}
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