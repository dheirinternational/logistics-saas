/**
 * Telegram Automated Notification Service for DHEIR Cargo
 * 
 * Supports dispatching automated inbound package alerts, customer message notifications,
 * and shipment request updates to the admin Telegram channel or staff group.
 * 
 * Requires:
 * - TELEGRAM_BOT_TOKEN (created via @BotFather)
 * - TELEGRAM_ADMIN_CHAT_ID (target chat ID or channel ID)
 */

type TelegramSendResult = {
  success: boolean
  messageId?: number
  reason?: string
}

export async function sendTelegramNotification(
  text: string,
  targetChatId?: string
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = targetChatId || process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    // Graceful fallback when Telegram env is not configured yet
    return {
      success: false,
      reason: "TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID is not configured in environment variables.",
    }
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })

    const json = await res.json()
    if (!res.ok || !json.ok) {
      console.warn("Telegram notification API error:", json?.description || res.statusText)
      return { success: false, reason: json?.description || "Failed to deliver Telegram message" }
    }

    return { success: true, messageId: json.result?.message_id }
  } catch (err: any) {
    console.error("Error sending Telegram notification:", err?.message || err)
    return { success: false, reason: err?.message || "Network error" }
  }
}

/**
 * Dispatches an automated inbound package alert (matches WeChat format shown by Ronke)
 */
export async function notifyTelegramPackageInbound(params: {
  trackingNumber: string
  customerCode?: string | null
  packageName?: string | null
  weight?: number | null
  weightUnit?: string | null
  warehouseName?: string | null
}): Promise<TelegramSendResult> {
  const dateStr = new Date().toISOString().slice(0, 10)
  const lines = [
    `<b>DHEIR CARGO : PACKAGE INBOUND NOTICE</b>`,
    ``,
    `<b>Tracking Number:</b> <code>${params.trackingNumber}</code>`,
    `<b>Customer Code:</b> ${params.customerCode || "Unassigned"}`,
    `<b>Package:</b> ${params.packageName || "General Goods"}`,
    `<b>Weight:</b> ${params.weight ?? "Pending"} ${params.weightUnit || "kg"}`,
    `<b>Warehouse:</b> ${params.warehouseName || "Guangzhou Warehouse"}`,
    `<b>Inbound Date:</b> ${dateStr}`,
  ]

  return sendTelegramNotification(lines.join("\n"))
}

/**
 * Dispatches an automated alert when a customer sends an inbox message
 */
export async function notifyTelegramCustomerMessage(params: {
  customerName?: string | null
  customerCode?: string | null
  title?: string | null
  body: string
}): Promise<TelegramSendResult> {
  const customerLabel = params.customerName
    ? `${params.customerName}${params.customerCode ? ` (${params.customerCode})` : ""}`
    : params.customerCode || "Customer"

  const lines = [
    `<b>DHEIR CARGO : NEW CUSTOMER MESSAGE</b>`,
    ``,
    `<b>From:</b> ${customerLabel}`,
    `<b>Subject:</b> ${params.title || "Support Inquiry"}`,
    ``,
    `<b>Message:</b>`,
    params.body.length > 400 ? `${params.body.slice(0, 400)}...` : params.body,
  ]

  return sendTelegramNotification(lines.join("\n"))
}

/**
 * Dispatches an automated alert when a customer creates a shipment request
 */
export async function notifyTelegramShipmentRequest(params: {
  requestId: number | string
  customerCode?: string | null
  channel?: string | null
  packageCount?: number | null
  paymentTiming?: string | null
}): Promise<TelegramSendResult> {
  const lines = [
    `<b>DHEIR CARGO : NEW SHIPMENT REQUEST</b>`,
    ``,
    `<b>Request ID:</b> #${params.requestId}`,
    `<b>Customer Code:</b> ${params.customerCode || "N/A"}`,
    `<b>Channel:</b> ${params.channel ? params.channel.toUpperCase() : "AIR"}`,
    `<b>Packages:</b> ${params.packageCount || 1} items`,
    `<b>Payment Timing:</b> ${params.paymentTiming || "Standard"}`,
  ]

  return sendTelegramNotification(lines.join("\n"))
}
