import { getSession } from "@/lib/db/session";
import { NextResponse } from "next/server";
import crypto from "crypto"
import { pool } from "@/lib/db/db";
import { Resend } from "resend";



const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(){
    try{
        const session = await getSession()
        if(!session){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            })
        }

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
                change_email_token = $1,
                change_email_expires = $2
            WHERE id = $3
            RETURNING *
        `, [hashedToken, expires, session.user_id])

        if (rows.length === 0){
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const email = rows[0].email
        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/change-email?token=${rawToken}`;

        await resend.emails.send({
            from: "D_Heir Logistics <onboarding@resend.dev>", // default test sender
            to: email,
            subject: "Email Change Requested",
            html: `
            <h2>Email Change Initialized</h2>
            <p>If this is not you Please ignore this email, Otherwise Proceed with the link below:</p>
            <a href="${verificationUrl}">Change your Email</a>
            `,
        });

        return NextResponse.json({
            success: true,
            message: "Check Email for link to change",
        })

    } catch (err) {
        console.error("Error sending verification email:", err);
        return NextResponse.json(
        { success: false, message: "Server error" },
        { status: 500 }
        );
    }
}