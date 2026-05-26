import { NextResponse } from "next/server"

/** @deprecated Use /api/monnify/initialize/shipment or /api/monnify/initialize/order */
export async function POST() {
  return NextResponse.json(
    {
      message:
        "Use POST /api/monnify/initialize/shipment or POST /api/monnify/initialize/order",
    },
    { status: 410 }
  )
}
