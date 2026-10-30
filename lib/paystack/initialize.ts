import type { InitializePaystackPaymentParams, PaystackInitResponse } from "./types"

export async function initializePaystackPayment({
  amount,
  customerEmail,
  paymentReference,
  redirectUrl,
  customerName,
  metaData,
}: InitializePaystackPaymentParams): Promise<PaystackInitResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured")
  }

  // Paystack expects amount in KOBO (1 Naira = 100 kobo)
  const amountInKobo = Math.round(Number(amount) * 100)
  if (amountInKobo <= 0 || isNaN(amountInKobo)) {
    throw new Error("Invalid payment amount")
  }

  const payload: Record<string, unknown> = {
    email: customerEmail,
    amount: amountInKobo,
    reference: paymentReference,
    callback_url: redirectUrl,
    metadata: {
      ...(metaData ?? {}),
      customer_name: customerName,
    },
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok || !data.status) {
    console.error("Paystack initialization failed:", data)
    throw new Error(data.message || "Failed to initialize Paystack payment")
  }

  const bodyData = data.data
  const authorizationUrl = bodyData.authorization_url

  return {
    authorizationUrl,
    accessCode: bodyData.access_code,
    reference: bodyData.reference ?? paymentReference,
    checkoutUrl: authorizationUrl,
  }
}

