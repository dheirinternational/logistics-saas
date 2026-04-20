import { pool } from "@/lib/db/db"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request){

    try{

        const { email } = await req.json()
        const userRes = await pool.query(`
            SELECT id FROM users 
            WHERE email = $1
        `, [email])

        if (userRes.rowCount === 0){
            return NextResponse.json({
                message: "If email exists, link sent"
            })
        }

        const user = userRes.rows[0]
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 mins


        await pool.query(`
            INSERT INTO password_resets (user_id, token, expires_at)
            VALUES ($1, $2, $3)            
        `,[user.id, token, expiresAt])

        const resetLink = `${process.env.BASE_URL}/auth/forgot-password?token=${token}`

        // send email
        await resend.emails.send({
            from: "D_Heir Logistics <onboarding@resend.dev>", // default test sender
            to: email,
            subject: "Password Change Requested",
            html: `
            <h2>Reset Password</h2>
            <p>If this is not you Please ignore this email</p>
            <p>Otherwise Proceed with the link below:</p>
            <a href="${resetLink}">Change Your Password</a>
            `,
        });
        
        return NextResponse.json({
            message: "Email Link Successfully Sent",
            success: true
        })

    }
    catch(err){
        console.error("Internal Server Error", err)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        })
    }

}