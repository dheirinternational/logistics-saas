"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { useRouter } from 'next/navigation'
import { NextPage } from 'next'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { FaTruck } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import Image from 'next/image'

const Page: NextPage = () => {
    const router = useRouter()

    const [isCreatingAccount, setIsCreatingAccount] = useState(false)

    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
        phone: ""
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (credentials.password !== credentials.confirm_password){ 
            alert("Passwords don't match")
            return
        }

        setIsCreatingAccount(true)
        
        const formData = new FormData(e.currentTarget)
        formData.append("role", "customer")
        const data = Object.fromEntries(formData)

        fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                router.push("/")
            } else {
                alert(data.error || "Registration failed")
            }
        })
        .catch(err => {
            console.error(err)
            alert("An error occurred")
        })
        .finally(() => {
            setIsCreatingAccount(false)
        })
    }


  return <div className='w-screen h-dvh max-h-screen center-items'>
    <div>
        <form className='' onSubmit={handleSubmit}>
            <div className=''>
                <figure className='w-15 h-15 rounded-full relative mt-8'>
                    <Image 
                    src={`/d_heir_logo.png`}
                    alt='company logo'
                    fill
                    />
                </figure>
                <p className='text-xs font-semibold'>
                    D_Heir Internationals
                </p>
            </div>
            <h1 className='my-2 font-bold text-2xl mt-6'>
                Sign up
            </h1>
            <div className='mt-8 space-y-4'>
                <div className='w-70'>
                    <InputComponent 
                    title='First Name'
                    name='first_name'
                    type='text'
                    state={credentials}
                    setState={setCredentials}
                    required
                    />
                </div>
                <div className='w-70'>
                    <InputComponent 
                    title='Last Name'
                    name='last_name'
                    type='text'
                    state={credentials}
                    setState={setCredentials}
                    required
                    />
                </div>
                <div className='w-70'>
                    <InputComponent 
                    title='Phone'
                    name='phone'
                    type='text'
                    state={credentials}
                    setState={setCredentials}
                    required
                    />
                </div>
                <div className='w-70'>
                    <InputComponent 
                    title='Email Address'
                    name='email'
                    type='email'
                    state={credentials}
                    setState={setCredentials}
                    required
                    />
                </div>
                <div className='w-70'>
                    <InputComponent 
                    title='Password'
                    name='password'
                    type='password'
                    state={credentials}
                    setState={setCredentials}
                    required
                    />
                </div>
                <div className='w-70'>
                    <InputComponent 
                    title='Confirm Password'
                    name='confirm_password'
                    type='password'
                    state={credentials}
                    setState={setCredentials}
                    required
                    />
                </div>
            </div>
            <div>
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
    </div>
  </div>
}

export default Page