import { sendSignupOtp } from "@/lib/auth/otpSignup"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body?.email

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    const result = await sendSignupOtp(req, email)

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          retryAfterSeconds: result.retryAfterSeconds,
        },
        { status: result.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent. Check your inbox.",
      retryAfterSeconds: result.retryAfterSeconds,
    })
  } catch (err) {
    console.error("send-otp error", err)
    return NextResponse.json(
      { success: false, message: "Could not send verification code. Try again." },
      { status: 500 }
    )
  }
}
