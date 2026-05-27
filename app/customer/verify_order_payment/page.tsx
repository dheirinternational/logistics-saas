"use client"

import { useCartStore } from "@/store/cartStore"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

export default function VerifyOrderPayment() {
  const searchParams = useSearchParams()
  const reference =
    searchParams.get("paymentReference") ||
    searchParams.get("reference") ||
    searchParams.get("transactionReference") ||
    ""

  const router = useRouter()
  const { clearCart } = useCartStore()
  const verified = useRef(false)

  useEffect(() => {
    if (verified.current) return

    const verifyPayment = async () => {
      if (!reference) {
        toast.error("No payment reference found")
        router.push("/customer/marketplace")
        return
      }

      verified.current = true

      try {
        const res = await fetch(
          `/api/monnify/verify/order/${encodeURIComponent(reference)}`
        )

        const result = await res.json()

        if (!res.ok) {
          toast.error(result.message || "Payment verification failed")
          router.push(result.redirect_to || "/customer/marketplace")
          return
        }

        clearCart()
        toast.success(result.message || "Payment successful")
        router.push(result.redirect_to || "/customer/marketplace")
      } catch (err) {
        console.error("Error verifying payment", err)
        toast.error("Payment verification failed")
        router.push("/customer/marketplace")
      }
    }

    verifyPayment()
  }, [reference, router, clearCart])

  return (
    <div className="p-body flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <DheirLoader color="#1A5FFF" size={12} />
      <h1 className="text-sm font-semibold">Verifying payment...</h1>
    </div>
  )
}
