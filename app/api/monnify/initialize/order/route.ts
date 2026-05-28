import { pool } from "@/lib/db/db"
import { getHost } from "@/lib/db/getHost"
import { getSession } from "@/lib/db/session"
import { generateOrderTrackingNumber } from "@/lib/generators/generateTrackingNumber"
import { initializeMonnifyPayment } from "@/lib/monnify/initialize"
import { isMonnifyCheckoutEnabled } from "@/lib/bankTransfer/config"
import { CartProduct } from "@/types/entityTypeDef"
import { NextRequest, NextResponse } from "next/server"
import { getUnitPriceForQuantity } from "@/lib/shop/pricing"

export async function POST(req: NextRequest) {
  const origin = getHost(req)
  const client = await pool.connect()

  try {
    if (!isMonnifyCheckoutEnabled()) {
      return NextResponse.json(
        { message: "Card payment is temporarily unavailable" },
        { status: 503 }
      )
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const {
      email,
      amount,
      delivery_fee = 0,
      extra_charges = 0,
      destination_address,
      customer_code,
      cart_items,
    } = await req.json()

    if (!email || !amount || !destination_address || !customer_code || !cart_items?.length) {
      return NextResponse.json(
        { message: "Missing required checkout fields" },
        { status: 400 }
      )
    }

    const user_id = session.user_id
    const order_id = generateOrderTrackingNumber()

    await client.query("BEGIN")

    const productIds = cart_items.map((item: CartProduct) => item.id)

    const productsRes = await client.query(
      `
      SELECT id, stock_quantity, name
      FROM products
      WHERE id = ANY($1)
      FOR UPDATE
      `,
      [productIds]
    )

    const productMap = new Map(productsRes.rows.map((p) => [p.id, p]))

    for (const item of cart_items) {
      const product = productMap.get(item.id)

      if (!product) {
        throw new Error("Product not found")
      }

      if (item.amount_to_be_ordered > product.stock_quantity) {
        throw new Error(`${product.name} is out of stock`)
      }
    }

    await client.query(
      `
      INSERT INTO orders (
        order_id,
        user_id,
        total_price,
        delivery_fee,
        extra_charges,
        payment_status,
        status,
        destination_address,
        customer_code
      )
      VALUES ($1, $2, $3, $4, $5, 'pending', 'Confirmed', $6, $7)
      `,
      [
        order_id,
        user_id,
        amount,
        delivery_fee,
        extra_charges,
        destination_address,
        customer_code,
      ]
    )

    for (const item of cart_items) {
      const price = getUnitPriceForQuantity({
        price: Number(item.price),
        discount_price: Number(item.discount_price ?? 0),
        discount_min_qty: Number(item.discount_min_qty ?? 0),
        quantity: Number(item.amount_to_be_ordered),
      })

      await client.query(
        `
        INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, product_image, product_name
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [
          order_id,
          item.id,
          Number(item.amount_to_be_ordered),
          price,
          item.image,
          item.name,
        ]
      )
    }

    const userRes = await client.query(
      `SELECT first_name, last_name FROM users WHERE id = $1 LIMIT 1`,
      [user_id]
    )
    const user = userRes.rows[0]
    const customerName =
      `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || email

    const checkout = await initializeMonnifyPayment({
      amount: Number(amount),
      customerName,
      customerEmail: email,
      paymentReference: order_id,
      paymentDescription: "DHEIR marketplace order",
      redirectUrl: `${origin}/customer/verify_order_payment?paymentReference=${encodeURIComponent(order_id)}`,
      metaData: {
        type: "order",
        order_id,
      },
    })

    await client.query(
      `
      UPDATE orders
      SET paystack_reference = $1,
          updated_at = NOW()
      WHERE order_id = $2
      `,
      [order_id, order_id]
    )

    await client.query("COMMIT")

    return NextResponse.json({
      message: "Payment initialized",
      data: checkout,
      order_id,
    })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Order payment initialization failed:", err)
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Error initializing payment",
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
