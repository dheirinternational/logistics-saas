import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/db/session"
import {
  isValidExpoPushToken,
  registerUserPushToken,
  unregisterUserPushToken,
} from "@/lib/notifications/push"

/**
 * POST /api/customer/push-tokens
 * Registers or refreshes an Expo push token for the signed-in user.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      )
    }

    const body = (await req.json().catch(() => ({}))) as {
      token?: unknown
      platform?: unknown
      deviceName?: unknown
      appVersion?: unknown
    }

    const token = typeof body.token === "string" ? body.token.trim() : ""
    if (!isValidExpoPushToken(token)) {
      return NextResponse.json(
        { success: false, message: "Valid Expo push token is required" },
        { status: 400 },
      )
    }

    await registerUserPushToken({
      userId: session.user_id,
      token,
      platform: body.platform,
      deviceName: typeof body.deviceName === "string" ? body.deviceName : null,
      appVersion: typeof body.appVersion === "string" ? body.appVersion : null,
    })

    return NextResponse.json({
      success: true,
      message: "Push token registered",
    })
  } catch (err) {
    console.error("POST /api/customer/push-tokens error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to register push token" },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/customer/push-tokens
 * Unregisters the given Expo push token for the signed-in user (e.g. on logout).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      )
    }

    const body = (await req.json().catch(() => ({}))) as { token?: unknown }
    const queryToken = req.nextUrl.searchParams.get("token")
    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : queryToken?.trim() || ""

    if (token) {
      await unregisterUserPushToken({
        userId: session.user_id,
        token,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Push token removed",
    })
  } catch (err) {
    console.error("DELETE /api/customer/push-tokens error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to remove push token" },
      { status: 500 },
    )
  }
}
