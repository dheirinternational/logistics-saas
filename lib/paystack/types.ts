export type PaystackPaymentType = "shipment" | "order"

export type InitializePaystackPaymentParams = {
  amount: number // in Naira (will be converted to kobo internally)
  customerEmail: string
  paymentReference: string
  redirectUrl: string
  customerName?: string
  metaData?: Record<string, unknown>
}

export type PaystackInitResponse = {
  authorizationUrl: string
  accessCode: string
  reference: string
  checkoutUrl: string // alias to authorizationUrl for UI compatibility
}

export type PaystackTransactionDetails = {
  reference: string
  status: "success" | "failed" | "abandoned" | string
  amount: number // in Naira (converted from kobo)
  channel?: string
  paidAt?: string
  currency?: string
  metadata?: Record<string, unknown>
  raw?: unknown
}

