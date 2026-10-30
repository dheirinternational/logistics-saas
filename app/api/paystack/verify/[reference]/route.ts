import { resolvePaymentType } from "@/lib/paystack/resolvePaymentType"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params
  const paymentType = await resolvePaymentType(reference)
  const base = new URL(req.url).origin

  if (paymentType === "shipment") {
    return NextResponse.redirect(
      new URL(`/api/paystack/verify/shipment/${encodeURIComponent(reference)}`, base)
    )
  }

  if (paymentType === "order") {
    return NextResponse.redirect(
      new URL(`/api/paystack/verify/order/${encodeURIComponent(reference)}`, base)
    )
  }

  return NextResponse.json({ message: "Payment reference not found" }, { status: 404 })
}

