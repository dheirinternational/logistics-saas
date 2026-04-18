"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function ChangeEmail(){

    const params = useSearchParams()
    const router = useRouter() 

    const [isChangingEmail, setIsChangingEmail] = useState(false)


    const changeEmail = async (newEmail: string) => {
        setIsChangingEmail(true)
        const token = params.get("token")
        try {
            const res = await fetch(`/api/auth/change-email?token=${token}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json" 
                },
                body: JSON.stringify({newEmail})
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
            toast.info("Redirecting...")
            router.push("/")
            
        } catch(err){
            toast.error("ERR:: Changing User Email")
            console.error("ERR:: Changing User Email", err)
        }
        finally{
            setIsChangingEmail(false)
        }
    }


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        changeEmail(data.email as string)
    }


    return(
        <div className="w-screen h-dvh center-items">
            <form 
            onSubmit={handleSubmit}
            className="bg-light p-body rounded shadow flex flex-col gap-3">
                
                <input 
                type="email" 
                className="text-xs border border-dark/20 outline-0 rounded w-50 px-2 py-2"
                required
                name="email"
                placeholder="Input New Email..."
                />
                
                <button 
                disabled={isChangingEmail}
                className="bg-accent-red text-white text-xs py-2 rounded">
                    {
                        isChangingEmail ?
                        <BeatLoader color="white" size={10}/> :
                        "Change Email"
                    }
                </button>

            </form>
        </div>
    )
}