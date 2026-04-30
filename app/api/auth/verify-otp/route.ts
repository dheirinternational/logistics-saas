import { pool } from "@/lib/db/db"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest){
    try{
        const { otp, email } = await req.json()

        const existingOtp = await pool.query(`
            SELECT * FROM otp
            WHERE email = $1
            ORDER BY created_at DESC
            LIMIT 1
        `, [email])

        if(existingOtp.rows.length === 0){
            return NextResponse.json({
                success: false,
                message: "OTP Does not exist"
            })
        }

        const record = existingOtp.rows[0]

        // check Expiry
        if(new Date() > record.expires_at){
            return NextResponse.json({
                success: false,
                message: "OTP has expired"
            })
        }

        // Check value
        if(record.value !== otp){
            return NextResponse.json({
                success: false,
                message: "Invalid OTP"
            })
        }

        // DELETE OTP After successful verification
        await pool.query(
            `DELETE FROM otp WHERE email = $1`,
            [record.email]
        )

        return NextResponse.json({
            sucess: true,
            message: "Email Successfully Verified"
        })


    }
    catch(err){
        console.log("Internal Server Error, Could not verify Email", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error, Could not verify Email"
        })
    }
}