import { VerifyTransaction } from "@/lib/monnify/verify";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest, {params} : {params: Promise<{reference: string}>}) => {
    try{
        const {reference} = await params
        const payment = await VerifyTransaction(reference)

        return NextResponse.json({
            success: true,
            message: "Payment verified",
            data: payment
        }, { status: 200 })
    }
    catch(err){
        console.error("Verfication failed", err)
        return NextResponse.json({
            success: false,
            message: "Verfication failed"
        }, { status: 500 })
    }
}