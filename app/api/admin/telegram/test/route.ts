import { getSession } from "@/lib/db/session"
import { sendTelegramNotification } from "@/lib/notifications/telegram"
import { isAdminOrStaff } from "@/lib/rbac/permissions"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !isAdminOrStaff(session)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const testMessage =
      body.message ||
      `<b>DHEIR Logistics : Telegram Notification Test</b>\n\nAutomated notifications are configured and operational.\nTime: ${new Date().toISOString()}`

    const result = await sendTelegramNotification(testMessage)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.reason || "Failed to dispatch Telegram message",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test message sent successfully to Telegram!",
      messageId: result.messageId,
    })
  } catch (err: any) {
    console.error("Error in Telegram test endpoint:", err)
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 },
    )
  }
}
