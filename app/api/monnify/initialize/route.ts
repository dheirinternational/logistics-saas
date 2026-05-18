import { initializePayment } from "@/lib/monnify/initialize";
import { NextResponse } from "next/server"


export const POST = async (req: Request) => {
    
    try{
        
        const body = await req.json();
        console.log(body.transactionRef)
        const payment = await initializePayment({   
            amount: body.amount,
            customerEmail: body.customerEmail,
            customerName: body.customerName,
            transactionRef: body.transactionRef
        })

        console.log(payment)

        return NextResponse.json({success: true, message: "Payment Initialized", data: payment})
    }
    catch(err: any){
        console.log("Payment initialization failed", err)
        return NextResponse.json({
            success: false,
            message: "Payment initialization failed"
        }, { status: 500 })
    }
}