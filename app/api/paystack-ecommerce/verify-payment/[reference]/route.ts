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

        const result = await res.json()

        if(!res.ok){
            console.error("Error Verifying Payment", result)  
        
            return NextResponse.json({
                message: "Error Verifying Payment",
                data: result
            }, {status: 500})       
        }     

        const status = result?.data?.status; // "success" | "failed" | "abandoned"
        const paystackRef = result?.data?.reference;

        if (status !== "success") {
            // optional: mark failed in DB
            await pool.query(
                `
                UPDATE orders
                SET payment_status = 'failed',
                    updated_at = NOW()
                WHERE paystack_reference = $1
                `,
                [paystackRef]
            );

            return NextResponse.json({
                message: "Payment not successful",
                redirect_to: `${process.env.NEXT_PUBLIC_APP_URL}/base/marketplace`
            });
        }

        const updateResult = await pool.query(`
            UPDATE orders
            SET payment_status = 'paid',
                paid_at = NOW(),
                updated_at = NOW()
            WHERE paystack_reference = $1
            RETURNING *
        `,
        [paystackRef]
        );

        console.log(updateResult)

        if (updateResult.rowCount === 0) {
           console.warn("No order found for reference:", paystackRef);
        }

        return NextResponse.json({
            message: "Payment Verified",
            order: updateResult.rows[0],
            redirect_to: `${process.env.NEXT_PUBLIC_APP_URL}/base/marketplace`
        })      

    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            message: "Internal Server Error",
        }, { status: 500 })
    }
}