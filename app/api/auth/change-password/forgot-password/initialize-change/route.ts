import { NextResponse } from "next/server"
import crypto from "crypto"
import { pool } from "@/lib/db/db"
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request){
    try{

        const { email } = await req.json()

        const rawToken = crypto
            .randomBytes(32)
            .toString("hex")

        const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex")

        const expires = new Date(Date.now() + 1000 * 60 * 60)

        const { rows } = await pool.query(`
            UPDATE users
            SET
                change_password_token = $1,
                change_password_expires = $2
            WHERE email = $3
            RETURNING *
        `, [hashedToken, expires, email])

        if (rows.length === 0){
            return NextResponse.json(
                { success: false, message: "Email/Account does not exist on database" },
                { status: 404 }
            );
        }

        const verificationUrl = `${process.env.BASE_URL}/auth/forgot-password?token=${rawToken}`;

        await resend.emails.send({
            from: "D_Heir Logistics <no-reply@dheirinternational.com>", // default test sender
            to: email,
            subject: "Password Change Requested",
            html: `
            <h2>Password Change Initialized</h2>
            <p>If this is not you Please ignore this email</p>
            <p>Otherwise Proceed with the link below:</p>
            <a href="${verificationUrl}">Change your password</a>
            `,
        });

        return NextResponse.json({
            success: true,
            message: "Link sent to email",
        })
    } catch (err) {
        console.error("Error sending verification email:", err);
        return NextResponse.json(
        { success: false, message: "Server error" },
        { status: 500 }
        );
    }

}