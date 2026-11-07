import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextRequest, NextResponse } from "next/server"

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Automatically sync exchange rate from free open API every 7 days.
 */
async function syncExchangeRatesIfNeeded() {
  try {
    const res = await pool.query(`SELECT * FROM money_rates WHERE name = 'dollar_to_naira' LIMIT 1`)
    const rateRow = res.rows[0]

    const lastUpdate = rateRow?.created_at ? new Date(rateRow.created_at).getTime() : 0
    const now = Date.now()

    // If rate row doesn't exist or is older than 7 days, sync from free API
    if (!rateRow || (now - lastUpdate) > SEVEN_DAYS_MS) {
      const apiRes = await fetch("https://open.er-api.com/v6/latest/USD")
      if (!apiRes.ok) return
      const data = await apiRes.json()
      const ngnRate = data?.rates?.NGN
      const cnyRate = data?.rates?.CNY

      if (typeof ngnRate === "number" && ngnRate > 0) {
        const roundedNgn = Number(ngnRate.toFixed(2))
        await pool.query(
          `UPDATE money_rates SET currency_two = $1, created_at = NOW() WHERE name = 'dollar_to_naira'`,
          [roundedNgn],
        )

        // Also update RMB to Naira if CNY rate available
        if (typeof cnyRate === "number" && cnyRate > 0) {
          const rmbToNgn = Number((ngnRate / cnyRate).toFixed(2))
          await pool.query(
            `UPDATE money_rates SET currency_two = $1, created_at = NOW() WHERE name = 'rmb_to_naira' OR name = 'yen_to_naira'`,
            [rmbToNgn],
          )
        }
      }
    }
  } catch (err) {
    console.error("Failed to auto-sync exchange rates:", err)
  }
}

export const GET = async () => {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      }, { status: 401 })
    }

    // Check and auto-sync if older than 7 days
    await syncExchangeRatesIfNeeded()

    const moneyRate = await pool.query(`
      SELECT * FROM money_rates ORDER BY id ASC
    `)

    return NextResponse.json({
      success: true,
      message: "Money Rates Fetched",
      data: moneyRate.rows,
    })
  } catch (err: any) {
    console.error("GET /api/money-exchange-rate error:", err)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { rate, force_sync } = body

    if (force_sync) {
      const apiRes = await fetch("https://open.er-api.com/v6/latest/USD")
      const data = await apiRes.json()
      const ngnRate = data?.rates?.NGN
      const cnyRate = data?.rates?.CNY

      if (typeof ngnRate === "number" && ngnRate > 0) {
        const roundedNgn = Number(ngnRate.toFixed(2))
        await pool.query(
          `UPDATE money_rates SET currency_two = $1, created_at = NOW() WHERE name = 'dollar_to_naira'`,
          [roundedNgn],
        )
        if (typeof cnyRate === "number" && cnyRate > 0) {
          const rmbToNgn = Number((ngnRate / cnyRate).toFixed(2))
          await pool.query(
            `UPDATE money_rates SET currency_two = $1, created_at = NOW() WHERE name = 'rmb_to_naira' OR name = 'yen_to_naira'`,
            [rmbToNgn],
          )
        }
      }
    } else if (typeof rate === "number" && rate > 0) {
      await pool.query(
        `UPDATE money_rates SET currency_two = $1, created_at = NOW() WHERE name = 'dollar_to_naira'`,
        [rate],
      )
    }

    const updated = await pool.query(`SELECT * FROM money_rates ORDER BY id ASC`)
    return NextResponse.json({ success: true, message: "Exchange rates updated", data: updated.rows })
  } catch (err: any) {
    console.error("POST /api/money-exchange-rate error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
