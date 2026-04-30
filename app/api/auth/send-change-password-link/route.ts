import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto"
import { pool } from "@/lib/db/db";

const resend = new Resend(process.env.RESEND_API_KEY)
const TIME_DURATION = 1000 * 60 * 10 // 10 Minutes

export async function POST(req: NextRequest){
    try{

        const { email } = await req.json()
        const token = crypto.randomUUID()
        const expires_at = new Date(Date.now() + TIME_DURATION)

        console.log(email, token)

        await pool.query(`
        INSERT INTO password_reset_tokens (token, email, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (email)
        DO UPDATE SET 
            token = EXCLUDED.token,
            expires_at = EXCLUDED.expires_at,
            created_at = NOW()
        `, [token, email, expires_at])

        

        const encodedEmail = encodeURIComponent(email)
        const resetLink = `${process.env.BASE_URL}/auth/change-password?token=${token}&email=${encodedEmail}`

        await resend.emails.send({
            from: "D_Heir Logistics <onboarding@resend.dev>", // default test sender
            to: email,
            subject: "DHEIRLOGISTICS Password Reset Link",
            html: `
                <p>You sent us a request to change your password. If you didn't initialize this process do ignore the link below, if not, proceed:</p>
                <br/>
                <br/>
                <h1>Password Reset Link</h1>
                <br />
                <a href="${resetLink}">Change your password</a>
                <br/>
                <br/>
                <p>Best Regards, DHEIRLOGISTICS!</p>

            `,
        });

        return NextResponse.json({
            sucess: true,
            message: "Check your email for password reset link"
        })

    }
    catch(err){
        console.error("Interval Server Error, could not send link", err)
        return NextResponse.json({
            success: false,
            message: "Interval Server Error, could not send link"
        }, {status: 500})
    }
}