import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";



export async function POST (req: NextRequest){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({ 
                message: "Unauthorized"
            })
        }

        const {email, amount, metadata} = await req.json()

        const res = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                amount,
                callback_url: "http://localhost:3000/base/verify_payment",
                metadata
            })
        })

        if(!res.ok){
            const errorData = await res.json()
            console.error("Error Initializing Payment", errorData)  
        
            return NextResponse.json({
                message: "Error Initializing Payment",
                data: errorData
            }, {status: 500})       
        }     

        const result = await res.json()
        console.log("Payment Initialization Result", result)

        return NextResponse.json({
            message: "Payment Initialized",
            data: result
        })      

    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            message: "Internal Server Error",
        })
    }
}