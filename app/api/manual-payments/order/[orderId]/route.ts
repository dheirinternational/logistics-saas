import { isBankTransferEnabled } from "@/lib/bankTransfer/config"
import {
  requireCustomerSession,
  submitManualPaymentProofTx,
} from "@/lib/manualPayments/actions"
import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db/db"
import type { CartProduct } from "@/types/entityTypeDef"
import { getManualPaymentContextForUser } from "@/lib/manualPayments/actions"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await requireCustomerSession()
    const { orderId } = await params

    const context = await getManualPaymentContextForUser(
      "order",
      orderId,
      session.user_id
    )

    if (!context) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: context })
  } catch (err) {
    console.error("Manual order payment context error:", err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Something went wrong" },
      { status: err instanceof Error && err.message === "Unauthorized" ? 401 : 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const client = await pool.connect()

  try {
    if (!isBankTransferEnabled()) {
      return NextResponse.json(
        { message: "Bank transfer is not available right now" },
        { status: 503 }
      )
    }

    const session = await requireCustomerSession()
    const { orderId } = await params
    const formData = await req.formData()

    const receipt = formData.get("receipt") as File | null
    const transferReference = String(formData.get("transfer_reference") ?? "")
    const customerNote = String(formData.get("customer_note") ?? "")
    const amount = Number(formData.get("amount"))
    const destinationAddress = String(formData.get("destination_address") ?? "")
    const customerCode = String(formData.get("customer_code") ?? "")
    const deliveryFee = Number(formData.get("delivery_fee") ?? 0)
    const extraCharges = Number(formData.get("extra_charges") ?? 0)
    const cartItemsRaw = String(formData.get("cart_items") ?? "")

    if (!receipt) {
      return NextResponse.json({ message: "Receipt is required" }, { status: 400 })
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    await client.query("BEGIN")

    // If the order already exists, this is a resubmission flow.
    // Don't require cart/address payload from the client; just accept a new receipt
    // and move the payment back to awaiting confirmation.
    const existingOrder = await client.query(
      `SELECT order_id FROM orders WHERE order_id = $1 LIMIT 1 FOR UPDATE`,
      [orderId]
    )

    if (existingOrder.rowCount === 0) {
      if (!destinationAddress.trim() || !customerCode.trim()) {
        return NextResponse.json(
          { message: "Missing delivery address or customer code" },
          { status: 400 }
        )
      }

      let cartItems: CartProduct[] = []
      try {
        cartItems = JSON.parse(cartItemsRaw) as CartProduct[]
      } catch {
        return NextResponse.json(
          { message: "Invalid cart payload" },
          { status: 400 }
        )
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return NextResponse.json({ message: "Cart is empty" }, { status: 400 })
      }

      // Create order ONLY at proof submission time.
      // Validate stock with row locks like Monnify init.
      const productIds = cartItems.map((item) => item.id)
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

      for (const item of cartItems) {
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
          payment_type,
          status,
          destination_address,
          customer_code,
          paystack_reference
        )
        VALUES ($1, $2, $3, $4, $5, 'pending', 'transfer', 'Confirmed', $6, $7, $8)
        `,
        [
          orderId,
          session.user_id,
          amount,
          deliveryFee,
          extraCharges,
          destinationAddress,
          customerCode,
          orderId,
        ]
      )

      for (const item of cartItems) {
        const price =
          item.discount_price && item.discount_price !== 0
            ? item.discount_price
            : item.price

        await client.query(
          `
          INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, product_image, product_name
          )
          VALUES ($1,$2,$3,$4,$5,$6)
          `,
          [
            orderId,
            item.id,
            Number(item.amount_to_be_ordered),
            price,
            item.image,
            item.name,
          ]
        )
      }
    }

    const result = await submitManualPaymentProofTx(client, {
      paymentType: "order",
      reference: orderId,
      userId: session.user_id,
      amount,
      transferReference,
      customerNote,
      receiptFile: receipt,
    })

    await client.query("COMMIT")

    return NextResponse.json({
      message: "Transfer proof submitted. We will confirm once received.",
      submission_id: result.submissionId,
      redirect_to: `/customer/orders?transfer=submitted&reference=${encodeURIComponent(
        orderId
      )}`,
    })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Manual order payment submit failed:", err)
    const message =
      err instanceof Error ? err.message : "Could not submit transfer proof"
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("already") || message.includes("cannot")
          ? 400
          : 500

    return NextResponse.json({ message }, { status })
  } finally {
    client.release()
  }
}
