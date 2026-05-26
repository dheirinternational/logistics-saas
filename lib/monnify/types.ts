export type MonnifyPaymentType = "shipment" | "order"

export type InitializeMonnifyPaymentParams = {
  amount: number
  customerName: string
  customerEmail: string
  paymentReference: string
  paymentDescription: string
  redirectUrl: string
  metaData?: Record<string, unknown>
}

export type MonnifyInitResponse = {
  transactionReference: string
  paymentReference: string
  checkoutUrl: string
}

export type MonnifyTransactionDetails = {
  paymentReference: string
  transactionReference: string
  paymentStatus: string
  amountPaid?: number
  paymentMethod?: string
  paidOn?: string
  metaData?: Record<string, unknown>
}
