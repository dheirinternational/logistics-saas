"use client"

import { FormEvent, useState } from "react"
import InputComponent from "../shipments/InputComponent"
import { IoCreate } from "react-icons/io5"
import { User } from "@/types/entityTypeDef"

type UserValues = Omit<User, "id" | "created_at">

const CreateUser = () => {

    const [userValues, setUserValues] = useState<UserValues>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "",
        phone: "", 
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputComponent name="firstName" type="text" title="First Name" state={userValues} setState={setUserValues}/>
        <InputComponent name="lastName" type="text" title="Last Name" state={userValues} setState={setUserValues}/>
        {userValues.lastName}
        <InputComponent name="email" type="email" title="Email" state={userValues} setState={setUserValues}/>
        <InputComponent name="password" type="password" title="Password" state={userValues} setState={setUserValues}/>
        <InputComponent name="phone" type="tel" title="Phone" state={userValues} setState={setUserValues}/>
        <InputComponent name="role" type="text" title="Role" state={userValues} setState={setUserValues}/>
        <div className="">
            <button className="flex items-center justify-center gap-1 bg-accent-blue px-4 py-3 rounded-lg mt-4 float-right">
                <IoCreate/>
                <p className="text-xs font-bold">
                    Add
                </p>
            </button>
        </div>
    </form>
  )
}

export default CreateUser