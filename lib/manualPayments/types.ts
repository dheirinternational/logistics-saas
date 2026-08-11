export type ManualPaymentType = "shipment" | "order" | "procurement_commitment" | "procurement_quote"

export type ManualPaymentSubmissionStatus =
  | "awaiting_confirmation"
  | "confirmed"
  | "rejected"
  | "superseded"

export type ManualPaymentSubmission = {
  id: number
  created_at: string
  updated_at: string
  payment_type: ManualPaymentType
  reference: string
  user_id: number
  amount: number
  transfer_reference: string | null
  customer_note: string | null
  receipt_storage_path: string
  receipt_mime_type: string
  status: ManualPaymentSubmissionStatus
  admin_note: string | null
  reviewed_by: number | null
  reviewed_at: string | null
}

export type ManualPaymentSubmissionWithCustomer = ManualPaymentSubmission & {
  customer_email: string
  customer_first_name: string | null
  customer_last_name: string | null
  customer_code: string | null
}
