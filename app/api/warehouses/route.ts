import { pool } from "@/lib/db/db"
import { getSession } from "@/lib/db/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const res = await pool.query(`
      SELECT * FROM warehouses
      ORDER BY name ASC
    `)

    return NextResponse.json({
      success: true,
      message: "Successfully fetched warehouses",
      data: res.rows,
    })
  } catch (err) {
    console.error("Internal Server Error, could not fetch warehouses", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error, could not fetch warehouses" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    const name = String(body.name ?? "").trim()
    const recipient_name = String(body.recipient_name ?? "").trim()
    const phone = String(body.phone ?? "").trim()
    const country = String(body.country ?? "").trim().toUpperCase()
    const province = String(body.province ?? "").trim()
    const city = String(body.city ?? "").trim()
    const district = String(body.district ?? "").trim()
    const street = String(body.street ?? "").trim()
    const building = String(body.building ?? "").trim()
    const postal_code = String(body.postal_code ?? "").trim()
    const type = String(body.type ?? "").trim().toLowerCase()

    if (!name || !recipient_name || !phone || !city || !street || !postal_code) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, recipient, phone, city, street, and postal code are required",
        },
        { status: 400 }
      )
    }

    if (!["NG", "CN"].includes(country)) {
      return NextResponse.json(
        { success: false, message: "Country must be NG or CN" },
        { status: 400 }
      )
    }

    if (!["air", "sea"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Type must be air or sea" },
        { status: 400 }
      )
    }

    if (country === "CN" && (!province || !district)) {
      return NextResponse.json(
        {
          success: false,
          message: "Province and district are required for China warehouses",
        },
        { status: 400 }
      )
    }

    const res = await pool.query(
      `
      INSERT INTO warehouses (
        name, recipient_name, phone, country, province, city, district, street, building, postal_code, type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        name,
        recipient_name,
        phone,
        country,
        province || null,
        city,
        district || null,
        street,
        building || null,
        postal_code,
        type,
      ]
    )

    return NextResponse.json(
      {
        success: true,
        message: "Warehouse added",
        data: res.rows[0],
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("Internal server Error, could not add warehouse", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
