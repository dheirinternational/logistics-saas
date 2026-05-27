"use client"

import { PortalAccountPageHeader } from "@/components/portal/account/PortalAccountPageHeader"
import { PortalCartItem } from "@/components/portal/shop/PortalCartItem"
import { calculateDeliveryZonePrice } from "@/lib/calculators/calculateDeliveryZonePrice"
import { useCartStore } from "@/store/cartStore"
import type { Address } from "@/types/entityTypeDef"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

type UserCheckout = {
  email: string
  code: string
}

export function PortalCartPage() {
  const cart = useCartStore((s) => s.cart)

  const [user, setUser] = useState<UserCheckout>({ email: "", code: "" })
  const [address, setAddress] = useState<Address | null>(null)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isPaying, setIsPaying] = useState(false)

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price =
        item.discount_price && item.discount_price > 0
          ? item.discount_price
          : item.price
      return acc + price * item.amount_to_be_ordered
    }, 0)
  }, [cart])

  const total = subtotal + deliveryFee

  useEffect(() => {
    let cancelled = false
    setLoadingUser(true)
    fetch("/api/users/my-data", { credentials: "include" })
      .then((r) => r.json())
      .then((result) => {
        if (cancelled) return
        if (!result?.data?.email || !result?.data?.code) return
        setUser({ email: result.data.email, code: result.data.code })
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load account details")
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingAddress(true)
    fetch("/api/addresses/user", { credentials: "include" })
      .then((r) => r.json())
      .then(async (result) => {
        if (cancelled) return
        const addr = result?.data?.[0] as Address | undefined
        if (!addr) {
          setAddress(null)
          setDeliveryFee(0)
          return
        }
        setAddress(addr)
        const fee = await calculateDeliveryZonePrice(addr.state)
        if (!cancelled) setDeliveryFee(Number(fee) || 0)
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load delivery address")
      })
      .finally(() => {
        if (!cancelled) setLoadingAddress(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const initializePayment = async () => {
    if (cart.length === 0) return
    if (!user.email || !user.code) {
      toast.error("Account details are still loading")
      return
    }
    if (!address) {
      toast.error("Add your delivery address first")
      return
    }

    setIsPaying(true)
    try {
      const res = await fetch("/api/monnify/initialize/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: total,
          delivery_fee: deliveryFee,
          extra_charges: 0,
          destination_address: `${address.street}, ${address.city}, ${address.state}, ${address.postal_code}`,
          cart_items: cart,
          customer_code: user.code,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message || "Could not start payment")
        return
      }

      if (result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl
        return
      }

      toast.error("Payment checkout URL missing")
    } catch (err) {
      console.error(err)
      toast.error("Could not start payment")
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="portal-account portal-cart">
      <PortalAccountPageHeader
        title="Cart"
        description="Review items, confirm delivery, and checkout."
        backHref="/customer/shop"
        backLabel="Shop"
      />

      <div className="portal-cart__layout">
        <section className="portal-cart__items portal-account__card">
          <div className="portal-cart__items-head">
            <h2 className="portal-account__card-title">Items</h2>
            <p className="portal-cart__count">{cart.length} item(s)</p>
          </div>

          {cart.length === 0 ? (
            <p className="portal-cart__empty">
              Your cart is empty.{" "}
              <Link className="portal-cart__link" href="/customer/shop">
                Browse the shop
              </Link>
              .
            </p>
          ) : (
            <div className="portal-cart__items-list">
              {cart.map((item) => (
                <PortalCartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <aside className="portal-cart__summary portal-account__card">
          <h2 className="portal-account__card-title">Summary</h2>

          <div className="portal-cart__lines">
            <div className="portal-cart__line">
              <span>Subtotal</span>
              <strong>₦{subtotal.toLocaleString()}</strong>
            </div>
            <div className="portal-cart__line">
              <span>Delivery</span>
              <strong>
                {loadingAddress ? (
                  <span className="portal-cart__muted">Loading…</span>
                ) : (
                  `₦${Number(deliveryFee).toLocaleString()}`
                )}
              </strong>
            </div>
            <div className="portal-cart__line portal-cart__line--total">
              <span>Total</span>
              <strong>₦{total.toLocaleString()}</strong>
            </div>
          </div>

          <div className="portal-cart__address">
            <p className="portal-cart__address-label">Delivery address</p>
            {loadingAddress ? (
              <p className="portal-cart__muted">Loading address…</p>
            ) : address ? (
              <p className="portal-cart__address-value">
                {address.street}, {address.city}, {address.state}{" "}
                {address.postal_code}
              </p>
            ) : (
              <p className="portal-cart__muted">
                No address on file.{" "}
                <Link className="portal-cart__link" href="/customer/my_address">
                  Add address
                </Link>
                .
              </p>
            )}
          </div>

          <button
            type="button"
            className="portal-packages__btn-primary portal-packages__btn-primary--block"
            disabled={
              cart.length === 0 ||
              isPaying ||
              loadingAddress ||
              loadingUser ||
              !address
            }
            onClick={initializePayment}
          >
            {isPaying ? (
              <DheirLoader color="#fff" size={8} />
            ) : (
              "Checkout"
            )}
          </button>
        </aside>
      </div>
    </div>
  )
}

