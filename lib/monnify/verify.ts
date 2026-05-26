import { getMonnifyToken, getMonnifyBaseUrl } from "./auth"
import type { MonnifyTransactionDetails } from "./types"

export function isMonnifyPaymentPaid(paymentStatus: string | undefined) {
  return paymentStatus === "PAID" || paymentStatus === "OVERPAID"
}

export async function verifyMonnifyTransaction(
  reference: string
): Promise<MonnifyTransactionDetails> {
  const token = await getMonnifyToken()
  const baseUrl = getMonnifyBaseUrl()
  const encoded = encodeURIComponent(reference)

  const endpoints = [
    `${baseUrl}/api/v2/transactions/${encoded}`,
    `${baseUrl}/api/v2/transactions/${encoded}?transactionReference=${encoded}`,
  ]

  let lastError: unknown

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok || !data.requestSuccessful) {
        lastError = data
        continue
      }

      const body = data.responseBody
      return {
        paymentReference: body.paymentReference ?? reference,
        transactionReference: body.transactionReference ?? reference,
        paymentStatus: body.paymentStatus,
        amountPaid: body.amountPaid,
        paymentMethod: body.paymentMethod,
        paidOn: body.paidOn,
        metaData: body.metaData,
      }
    } catch (err) {
      lastError = err
    }
  }

  console.error("Monnify verification failed for reference:", reference, lastError)
  throw new Error("Verification failed")
}
