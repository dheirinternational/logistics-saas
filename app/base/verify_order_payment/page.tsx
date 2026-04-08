"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "react-toastify"


export default function VerifyPayment(){

    const reference = useSearchParams().get("reference") || ""   

    const router = useRouter()

    useEffect(() => {
        const verifyPayment = async () => {
            try{
                const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paystack-ecommerce/verify-payment/${reference}`)   
                
                if(!res.ok){
                    const errorData = await res.json()
                    console.error("Error Verifying Payment", errorData)  
                    toast.error("Error Verifying Payment")  
                    return
                }

                

                const result = await res.json()
                toast.success(result.message)  

                console.log("Verification Result", result.redirect_to)
                router.push(result.redirect_to)
            }
            catch(err){
                console.error("Error Verifying Payment", err)
                toast.error("Error Verifying Payment")  
            }  
        }
        if(reference){
            verifyPayment()
        }   
        else{
            toast.error("No Payment Reference Found")
        }    
    })

    return(
        <div className="p-body">
            <h1 className="text-sm font-semibold">
                <>

                    Verifying Payment...
                </>
            </h1>
        </div>
    )
}