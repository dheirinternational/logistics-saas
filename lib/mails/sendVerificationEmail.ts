import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
    
    // Create link (use unhashed token)
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${token}`;

    await resend.emails.send({
        from: "D_Heir Logistics <onboarding@resend.dev>", // default test sender
        to: email,
        subject: "Verify your email",
        html: `
        <h2>Verify your email</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${verificationUrl}">Verify Email</a>
        `,
    });

    
     
}