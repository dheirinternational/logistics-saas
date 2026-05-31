"use client"

import { PortalPageBack } from "@/components/portal/PortalPageBack"
import { PortalPolicyInfoButton } from "@/components/portal/PortalPolicyInfoButton"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { LOGISTICS_SHIPPING_POLICY } from "@/lib/portal/customerPolicies"
import { formatPaymentAmount } from "@/lib/portal/paymentDisplay"
import { useCartStore } from "@/store/cartStore"
import { IconBuildingBank, IconCopy, IconUpload } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "@/lib/ui/toast"

type BankDetails = {
  bankName: string
  accountNumber: string
  accountName: string
}

type TransferContext = {
  paymentType: "shipment" | "order"
  reference: string
  amount: number
  label: string
  status: string
  latestSubmission: {
    id: number
    status: string
    created_at: string
    admin_note: string | null
  } | null
}

type PortalBankTransferPageProps = {
  paymentType: "shipment" | "order"
  reference: string
  backHref: string
  backLabel: string
  successRedirect: string
}

export function PortalBankTransferPage({
  paymentType,
  reference,
  backHref,
  backLabel,
  successRedirect,
}: PortalBankTransferPageProps) {
  const { clearCart } = useCartStore()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [bank, setBank] = useState<BankDetails | null>(null)
  const [context, setContext] = useState<TransferContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [transferReference, setTransferReference] = useState("")
  const [customerNote, setCustomerNote] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const apiBase =
    paymentType === "shipment"
      ? `/api/manual-payments/shipment/${encodeURIComponent(reference)}`
      : `/api/manual-payments/order/${encodeURIComponent(reference)}`

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bankRes, contextRes] = await Promise.all([
        fetch("/api/bank-transfer/config", { credentials: "include" }),
        fetch(apiBase, { credentials: "include" }),
      ])

      const bankJson = await bankRes.json()
      const contextJson = await contextRes.json()

      if (!bankRes.ok) {
        toast.error(bankJson.message ?? "Bank transfer is unavailable")
        return
      }

      if (!contextRes.ok) {
        toast.error(contextJson.message ?? "Payment not found")
        return
      }

      setBank(bankJson.data)
      setContext(contextJson.data)
    } catch {
      toast.error("Could not load transfer details")
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  useEffect(() => {
    load()
  }, [load])

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Could not copy")
    }
  }

  const handleSubmit = async () => {
    if (!context || !receiptFile) {
      toast.error("Upload your transfer receipt to continue")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("receipt", receiptFile)
      formData.append("amount", String(context.amount))
      formData.append("transfer_reference", transferReference)
      formData.append("customer_note", customerNote)

      const res = await fetch(apiBase, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message ?? "Could not submit transfer proof")
        return
      }

      toast.success(result.message ?? "Transfer proof submitted")
      if (paymentType === "order") {
        clearCart()
      }
      router.push(result.redirect_to || successRedirect)
    } catch {
      toast.error("Could not submit transfer proof")
    } finally {
      setSubmitting(false)
    }
  }

  const isAwaiting =
    context?.status === "awaiting_confirmation" ||
    context?.latestSubmission?.status === "awaiting_confirmation"

  const isPaid = context?.status === "paid"

  const isRejected =
    context?.latestSubmission?.status === "rejected" &&
    context?.status !== "awaiting_confirmation"

  return (
    <div className="portal-account portal-payments portal-bank-transfer">
      <header className="portal-account__header">
        <PortalPageBack href={backHref} label={backLabel} />
        <h1 className="portal-account__title">
          Pay by bank transfer
          {paymentType === "shipment" ? (
            <PortalPolicyInfoButton
              policy={LOGISTICS_SHIPPING_POLICY}
              label="Shipping and waybill policy"
            />
          ) : null}
        </h1>
        <p className="portal-account__subtitle">
          Transfer the exact amount, use the reference below, then upload your receipt.
        </p>
      </header>

      {loading ? (
        <div className="portal-packages__loading flex justify-center py-16">
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : !bank || !context ? (
        <div className="portal-payments__empty portal-home__panel">
          <p>Transfer details are unavailable.</p>
          <Link className="portal-cart__link" href={backHref}>
            Go back
          </Link>
        </div>
      ) : (
        <>
          <section className="portal-home__panel portal-bank-transfer__summary">
            <p className="portal-payments__summary-label">
              {paymentType === "shipment" ? "Shipment" : "Order"}
            </p>
            <p className="portal-bank-transfer__reference">{context.label}</p>
            <p className="portal-payments__summary-value tabular-nums">
              {formatPaymentAmount(context.amount)}
            </p>
            <p className="portal-payments__summary-hint">
              Use this exact amount - partial transfers cannot be confirmed.
            </p>
          </section>

          {isPaid ? (
            <div className="portal-home__panel portal-bank-transfer__notice portal-bank-transfer__notice--success">
              <p>This payment is already marked as paid.</p>
              <Link className="portal-cart__link" href={backHref}>
                Return
              </Link>
            </div>
          ) : isAwaiting ? (
            <div className="portal-home__panel portal-bank-transfer__notice">
              <span className="portal-payments__status portal-payments__status--awaiting">
                Awaiting confirmation
              </span>
              <p className="portal-bank-transfer__notice-text">
                We received your transfer proof and are verifying it. This usually
                takes a short while during business hours.
              </p>
            </div>
          ) : (
            <>
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
                      <span>{context.reference}</span>
                      <button
                        type="button"
                        className="portal-bank-transfer__copy-btn"
                        onClick={() => copyText(context.reference, "Reference")}
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

              {isRejected && context.latestSubmission?.admin_note ? (
                <div className="portal-home__panel portal-bank-transfer__notice portal-bank-transfer__notice--reject">
                  <p className="portal-bank-transfer__notice-title">Previous proof rejected</p>
                  <p className="portal-bank-transfer__notice-text">
                    {context.latestSubmission.admin_note}
                  </p>
                  <p className="portal-bank-transfer__notice-text">
                    You can submit a new receipt below.
                  </p>
                </div>
              ) : null}

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
                    <DheirLoader color="#fff" size={8} />
                  ) : (
                    "Submit transfer proof"
                  )}
                </button>
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}
