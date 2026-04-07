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
        
        const shipmentTrackingNumber = result.data.metadata.shipment_tracking_number
        const {fees, channel} = result.data

        if(result.data.status === "success"){
            await pool.query(`
            UPDATE payments
            SET 
                status = 'paid',
                paid_at = NOW(),
                fees = $1,
                channel = $2,
                transaction_ref = $3
            WHERE shipment_tracking_number = $4
        `, [fees, channel, reference, shipmentTrackingNumber])

            await pool.query(`
            UPDATE shipments
                SET paid_for = true
            WHERE tracking_number = $1
        `, [shipmentTrackingNumber])    
        }

        // redirect("/base/pending_payments")        
        return NextResponse.json({
            message: "Payment Verified",
            redirect_to: `${process.env.NEXT_PUBLIC_APP_URL}/base/pending_payments`
        })      

    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            message: "Internal Server Error",
        })
    }
}