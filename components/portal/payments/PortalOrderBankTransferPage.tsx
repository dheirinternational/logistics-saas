"use client"

import { PortalPageBack } from "@/components/portal/PortalPageBack"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { fetchShopDeliveryQuote } from "@/lib/shop/fetchShopDeliveryQuote"
import type { ShopDeliveryFeeQuote } from "@/lib/shop/deliveryFee"
import { formatPaymentAmount } from "@/lib/portal/paymentDisplay"
import { getUnitPriceForQuantity } from "@/lib/shop/pricing"
import { toast } from "@/lib/ui/toast"
import { useCartStore } from "@/store/cartStore"
import type { Address, CartProduct } from "@/types/entityTypeDef"
import { IconBuildingBank, IconCopy, IconUpload } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type BankDetails = {
  bankName: string
  accountNumber: string
  accountName: string
}

type UserCheckout = {
  email: string
  code: string
}

export function PortalOrderBankTransferPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cart = useCartStore((s) => s.cart)
  const clearCart = useCartStore((s) => s.clearCart)

  const [bank, setBank] = useState<BankDetails | null>(null)
  const [user, setUser] = useState<UserCheckout>({ email: "", code: "" })
  const [address, setAddress] = useState<Address | null>(null)
  const [deliveryQuote, setDeliveryQuote] = useState<ShopDeliveryFeeQuote>({
    zoneFee: 0,
    chargedFee: 0,
    freeDelivery: false,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [reference, setReference] = useState<string>("")
  const [transferReference, setTransferReference] = useState("")
  const [customerNote, setCustomerNote] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = getUnitPriceForQuantity({
        price: item.price,
        discount_price: item.discount_price,
        discount_min_qty: item.discount_min_qty,
        quantity: item.amount_to_be_ordered,
      })
      return acc + price * item.amount_to_be_ordered
    }, 0)
  }, [cart])

  const deliveryFee = deliveryQuote.chargedFee

  const total = subtotal + deliveryFee

  const destinationAddress = useMemo(() => {
    if (!address) return ""
    return `${address.street}, ${address.city}, ${address.state}, ${address.postal_code}`
  }, [address])

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Could not copy")
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (cart.length === 0) {
        setLoading(false)
        return
      }

      const [bankRes, userRes, addressRes, refRes] = await Promise.all([
        fetch("/api/bank-transfer/config", { credentials: "include" }),
        fetch("/api/users/my-data", { credentials: "include" }),
        fetch("/api/addresses/user", { credentials: "include" }),
        fetch("/api/manual-payments/order/reference", {
          method: "POST",
          credentials: "include",
        }),
      ])

      const bankJson = await bankRes.json()
      const userJson = await userRes.json()
      const addressJson = await addressRes.json()
      const refJson = await refRes.json()

      if (!bankRes.ok) {
        toast.error(bankJson.message ?? "Bank transfer is unavailable")
        return
      }

      if (!userRes.ok) {
        toast.error(userJson.message ?? "Could not load your profile")
        return
      }

      if (!addressRes.ok) {
        toast.error(addressJson.message ?? "Add a delivery address first")
        return
      }

      if (!refRes.ok) {
        toast.error(refJson.message ?? "Could not generate payment reference")
        return
      }

      const addr = (addressJson?.data?.[0] as Address | undefined) ?? null
      if (!addr) {
        toast.error("Add a delivery address first")
        return
      }

      const quote = await fetchShopDeliveryQuote(addr.state)

      setBank(bankJson.data)
      setUser({ email: userJson.data.email, code: userJson.data.code })
      setAddress(addr)
      setDeliveryQuote(quote)
      setReference(refJson.data.reference)
    } catch {
      toast.error("Could not load transfer details")
    } finally {
      setLoading(false)
    }
  }, [cart.length])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async () => {
    if (!receiptFile) {
      toast.error("Upload your transfer receipt to continue")
      return
    }

    if (!reference) {
      toast.error("Payment reference not ready yet")
      return
    }

    if (!address) {
      toast.error("Add your delivery address first")
      return
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("receipt", receiptFile)
      formData.append("amount", String(total))
      formData.append("delivery_fee", String(deliveryFee))
      formData.append("delivery_state", address.state)
      formData.append("extra_charges", "0")
      formData.append("destination_address", destinationAddress)
      formData.append("customer_code", user.code)
      formData.append("cart_items", JSON.stringify(cart))
      formData.append("transfer_reference", transferReference)
      formData.append("customer_note", customerNote)

      const res = await fetch(
        `/api/manual-payments/order/${encodeURIComponent(reference)}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      )

      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message ?? "Could not submit transfer proof")
        return
      }

      toast.success(result.message ?? "Transfer proof submitted")
      clearCart()
      router.push(result.redirect_to || "/customer/orders")
    } catch {
      toast.error("Could not submit transfer proof")
    } finally {
      setSubmitting(false)
    }
  }

  if (!loading && cart.length === 0) {
    return (
      <div className="portal-account portal-payments portal-bank-transfer">
        <header className="portal-account__header">
          <PortalPageBack href="/customer/marketplace/cart" label="Cart" />
          <h1 className="portal-account__title">Pay by bank transfer</h1>
          <p className="portal-account__subtitle">Your cart is empty.</p>
        </header>
        <div className="portal-payments__empty portal-home__panel">
          <p>Nothing to pay for yet.</p>
          <Link className="portal-cart__link" href="/customer/shop">
            Browse the shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-account portal-payments portal-bank-transfer">
      <header className="portal-account__header">
        <PortalPageBack href="/customer/marketplace/cart" label="Cart" />
        <h1 className="portal-account__title">Pay by bank transfer</h1>
        <p className="portal-account__subtitle">
          Transfer the exact amount, use the reference below, then upload your
          receipt. Your order will only be created after you submit proof.
        </p>
      </header>

      {loading ? (
        <div className="portal-packages__loading flex justify-center py-16">
          <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : !bank || !reference ? (
        <div className="portal-payments__empty portal-home__panel">
          <p>Transfer details are unavailable.</p>
          <Link className="portal-cart__link" href="/customer/marketplace/cart">
            Go back
          </Link>
        </div>
      ) : (
        <>
          <section className="portal-home__panel portal-bank-transfer__summary">
            <p className="portal-payments__summary-label">Order</p>
            <p className="portal-bank-transfer__reference">{reference}</p>
            <p className="portal-payments__summary-value tabular-nums">
              {formatPaymentAmount(total)}
            </p>
            <p className="portal-payments__summary-hint">
            Use this exact amount - partial transfers cannot be confirmed.
            </p>
          </section>

          <section className="portal-home__panel portal-bank-transfer__bank">
            <div className="portal-bank-transfer__bank-head">
              <IconBuildingBank size={22} stroke={1.5} aria-hidden />
              <h2 className="portal-account__card-title">Bank details</h2>
            </div>

            <dl className="portal-bank-transfer__bank-grid">
              <div>
                <dt>Bank</dt>
                <dd>{bank.bankName}</dd>
              </div>
              <div>
                <dt>Account name</dt>
                <dd>{bank.accountName}</dd>
              </div>
              <div className="portal-bank-transfer__bank-wide">
                <dt>Account number</dt>
                <dd className="portal-bank-transfer__copy-row">
                  <span className="tabular-nums">{bank.accountNumber}</span>
                  <button
                    type="button"
                    className="portal-bank-transfer__copy-btn"
                    onClick={() => copyText(bank.accountNumber, "Account number")}
                  >
                    <IconCopy size={16} stroke={1.5} aria-hidden />
                    Copy
                  </button>
                </dd>
              </div>
              <div className="portal-bank-transfer__bank-wide">
                <dt>Payment reference (narration)</dt>
                <dd className="portal-bank-transfer__copy-row">
                  <span>{reference}</span>
                  <button
                    type="button"
                    className="portal-bank-transfer__copy-btn"
                    onClick={() => copyText(reference, "Reference")}
                  >
                    <IconCopy size={16} stroke={1.5} aria-hidden />
                    Copy
                  </button>
                </dd>
              </div>
            </dl>

            <p className="portal-bank-transfer__hint">
              Include the reference exactly as shown so we can match your transfer.
            </p>
          </section>

          <section className="portal-home__panel portal-bank-transfer__upload">
            <h2 className="portal-account__card-title">Upload receipt</h2>
            <p className="portal-bank-transfer__hint">
            JPG, PNG, WebP, or PDF - max 5MB.
            </p>

            <div className="portal-bank-transfer__fields">
              <label className="portal-packages__field" htmlFor="transfer-ref">
                <span className="portal-packages__field-label">
                  Your bank transfer reference (optional)
                </span>
                <input
                  id="transfer-ref"
                  className="portal-payments__input"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="e.g. session ID from your bank app"
                />
              </label>

              <label className="portal-packages__field" htmlFor="customer-note">
                <span className="portal-packages__field-label">Note (optional)</span>
                <input
                  id="customer-note"
                  className="portal-payments__input"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Anything we should know"
                />
              </label>

              <div className="portal-packages__field">
                <span className="portal-packages__field-label">Receipt file</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="portal-bank-transfer__file-input"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="portal-bank-transfer__file-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload size={18} stroke={1.5} aria-hidden />
                  {receiptFile ? receiptFile.name : "Choose receipt file"}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="portal-packages__btn-primary portal-packages__btn-primary--block"
              disabled={submitting || !receiptFile}
              onClick={handleSubmit}
            >
              {submitting ? (
                <DHEIRLoader color="#fff" size={8} />
              ) : (
                "Submit transfer proof"
              )}
            </button>
          </section>
        </>
      )}
    </div>
  )
}

