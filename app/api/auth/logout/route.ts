import { clearSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function POST() {
    await clearSession()
    return NextResponse.json({ success: true })
}