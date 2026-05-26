import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSignupOtpEmail(email: string, otp: string) {
  const code = otp.padStart(6, "0")

  await resend.emails.send({
    from: "DHEIR International <no-reply@dheirinternational.com>",
    to: email,
    subject: "Your DHEIR verification code",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; color: #12141a;">
        <p style="font-size: 15px; line-height: 1.6;">Use this code to verify your email and finish creating your DHEIR account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.2em; margin: 24px 0;">${code}</p>
        <p style="font-size: 14px; color: #8b919e;">This code expires in 10 minutes. If you did not sign up, you can ignore this email.</p>
        <p style="font-size: 14px; margin-top: 24px;">DHEIR International</p>
      </div>
    `,
  })
}
