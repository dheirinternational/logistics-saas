"use client"

import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { useState } from "react"
import { toast } from "@/lib/ui/toast"

type MonnifyPaymentButtonProps = {
  amount: number
  customerEmail: string
  customerName: string
  paymentReference: string
  className?: string
  disabled?: boolean
}

export default function MonnifyPaymentButton({
  amount,
  customerEmail,
  customerName,
  paymentReference,
  className = "bg-accent-blue flex gap-1 items-center h-fit px-4 py-2 text-white rounded text-xs",
  disabled = false,
}: MonnifyPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    if (!customerEmail) {
      toast.error("Account email is required to pay")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/monnify/initialize/shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_ref: paymentReference,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message || "Could not start payment")
        return
      }

      if (!result.data?.checkoutUrl) {
        toast.error("Payment checkout URL missing")
        return
      }

      window.location.href = result.data.checkoutUrl
    } catch (err) {
      console.error("Monnify payment error:", err)
      toast.error("Could not start payment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || isLoading || !paymentReference}
      className={className}
      onClick={handlePayment}
    >
      {isLoading ? (
        <DHEIRLoader color="white" size={6} />
      ) : (
        <>Pay ₦{Number(amount).toLocaleString()}</>
      )}
    </button>
  )
}
