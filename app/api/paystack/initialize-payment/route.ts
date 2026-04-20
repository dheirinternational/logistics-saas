import { getHost } from "@/lib/db/getHost";
import { getSession } from "@/lib/db/session";
import { NextRequest, NextResponse } from "next/server";



export async function POST (req: NextRequest){

    const origin = getHost(req)

    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({ 
                message: "Unauthorized"
            }, {status: 401})
        }

        const {email, amount, metadata, reference} = await req.json()

        // const user_id = session.user_id


        const res = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                amount,
                reference,
                callback_url: `${origin}/base/verify_payment`,
                metadata: {
                    ...metadata,
                    type: "shipment_payment"
                }
            })
        })

        const result = await res.json()

        if(!res.ok){
            console.error("Error Initializing Payment", result)  
        
            return NextResponse.json({
                message: "Error Initializing Payment",
                data: result
            }, {status: 500})       
        }     

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