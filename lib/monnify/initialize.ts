import { getMonnifyToken, getMonnifyBaseUrl } from "./auth"
import type { InitializeMonnifyPaymentParams, MonnifyInitResponse } from "./types"

export async function initializeMonnifyPayment({
  amount,
  customerName,
  customerEmail,
  paymentReference,
  paymentDescription,
  redirectUrl,
  metaData,
}: InitializeMonnifyPaymentParams): Promise<MonnifyInitResponse> {
  const contractCode = process.env.MONNIFY_CONTRACT_CODE
  if (!contractCode) {
    throw new Error("MONNIFY_CONTRACT_CODE is not configured")
  }

  const token = await getMonnifyToken()
  const baseUrl = getMonnifyBaseUrl()

  const res = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Number(amount),
      customerName,
      customerEmail,
      paymentReference,
      paymentDescription,
      currencyCode: "NGN",
      contractCode,
      redirectUrl,
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
      metaData: metaData ?? {},
    }),
  })

  const data = await res.json()

  if (!res.ok || !data.requestSuccessful) {
    console.error("Monnify init failed:", data)
    throw new Error(data.responseMessage || "Failed to initialize payment")
  }

  const body = data.responseBody

  return {
    transactionReference: body.transactionReference,
    paymentReference: body.paymentReference ?? paymentReference,
    checkoutUrl: body.checkoutUrl,
  }
}
