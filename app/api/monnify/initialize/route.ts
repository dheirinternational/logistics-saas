import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"


export const POST = async (req: Request) => {
    const origin = new URL(req.url).host
    
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        const {amount, customerEmail, paymentReference, paymentDescription, currencyCode, redirectUrl, paymentMethods, metaData } = await req.json()


    }
    catch(err: any){
        console.log("Internal server error", err)
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 })
    }
}