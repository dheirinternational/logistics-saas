import type { Payment } from "@/types/entityTypeDef"

export function formatPaymentDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatPaymentAmount(amount: number) {
  return `₦${Number(amount).toLocaleString()}`
}

export function paymentStatusLabel(status: Payment["status"]) {
  if (status === "paid") return "Paid"
  if (status === "pending") return "Pending"
  return "Failed"
}
