import { verifySignupOtp } from "@/lib/auth/otpSignup"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body?.email
    const otp = body?.otp

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    if (otp === undefined || otp === null || String(otp).trim() === "") {
      return NextResponse.json(
        { success: false, message: "Verification code is required" },
        { status: 400 }
      )
    }

    const result = await verifySignupOtp(email, String(otp))

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email verified. You can finish creating your account.",
    })
  } catch (err) {
    console.error("verify-otp error", err)
    return NextResponse.json(
      { success: false, message: "Could not verify code. Try again." },
      { status: 500 }
    )
  }
}
