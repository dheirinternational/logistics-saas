import type { PaystackTransactionDetails } from "./types"

export function isPaystackPaymentPaid(status: string | undefined): boolean {
  return status?.toLowerCase() === "success"
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackTransactionDetails> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured")
  }

  const encoded = encodeURIComponent(reference)
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encoded}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  const data = await res.json()

  if (!res.ok || !data.status) {
    console.error("Paystack verification failed for reference:", reference, data)
    throw new Error(data?.message || "Verification failed")
  }

  const transaction = data.data
  // Amount from Paystack is in kobo, convert back to Naira
  const amountInNaira = typeof transaction.amount === "number" ? transaction.amount / 100 : 0

  return {
    reference: transaction.reference ?? reference,
    status: transaction.status,
    amount: amountInNaira,
    channel: transaction.channel,
    paidAt: transaction.paid_at,
    currency: transaction.currency,
    metadata: transaction.metadata,
    raw: transaction,
  }
}

