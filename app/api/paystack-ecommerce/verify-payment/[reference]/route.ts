import { pool } from "@/lib/db/db";
import { NextRequest, NextResponse } from "next/server";



export async function GET (req: NextRequest, {params} : {params: Promise<{reference: string}>}){
    try{

        const { reference } = await params

        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
        })

        if(!res.ok){
            const errorData = await res.json()
            console.error("Error Verifying Payment", errorData)  
        
            return NextResponse.json({
                message: "Error Verifying Payment",
                data: errorData
            }, {status: 500})       
        }     

        const result = await res.json()
        console.log("Payment Verification Result", result)
    

        return NextResponse.json({
            message: "Payment Verified",
            redirect_to: `${process.env.NEXT_PUBLIC_APP_URL}/base/marketplace`
        })      

    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            message: "Internal Server Error",
        })
    }
}