"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { redirect, useRouter } from 'next/navigation'
import { NextPage } from 'next'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { FaTruck } from 'react-icons/fa'

const Page: NextPage = () => {
    const router = useRouter()

    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

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
            console.log(data.user?.role)
            
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
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
                setError(result.error || "Login failed")
                return
            }

            await handleSession()
        }
        catch(err){
            setError("An error occurred. Please try again.")
        }
        finally{
            setIsLoading(false)
        }
    } 

  return <div className='w-screen h-dvh max-h-screen center-items'>
    <div className=''>
        <div className='mb-10'>
            <FaTruck className='text-3xl'/>
            <p className='text-xs font-semibold'>
                D_Heir Internationals
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
                <button className='w-full bg-accent-blue text-white mt-6 py-2 rounded'>
                    Log in
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
        <Link href={"/auth/login"} className='text-xs'>
            Forgot password
        </Link>
    </div>
  </div>
}

export default Page