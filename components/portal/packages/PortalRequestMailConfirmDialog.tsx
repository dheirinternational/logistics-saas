"use client"

import { PortalFormField, PortalFormTextarea } from "@/components/portal/packages/PortalFormField"
import { IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"

const PACKAGING_OPTIONS = [
  "Easy Packaging Paper",
  "Balloon Cotton Box",
  "Vacuum Service ",
  "Normal Standard Packaging",
] as const

type PackagingOption = (typeof PACKAGING_OPTIONS)[number]

type PortalRequestMailConfirmDialogProps = {
  open: boolean
  submitting: boolean
  onClose: () => void
  onSubmit: (packaging: string, customerNote: string) => Promise<void>
}

export function PortalRequestMailConfirmDialog({
  open,
  submitting,
  onClose,
  onSubmit,
}: PortalRequestMailConfirmDialogProps) {
  const [step, setStep] = useState<"policy" | "confirm">("policy")
  const [packaging, setPackaging] = useState<PackagingOption | null>(null)
  const [customerNote, setCustomerNote] = useState("")

  useEffect(() => {
    if (!open) return
    setStep("policy")
    setPackaging(null)
    setCustomerNote("")
  }, [open])

  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose()
    }
    document.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [open, submitting, onClose])

  if (!open) return null

  const handleConfirm = async () => {
    if (!customerNote.trim()) {
      toast.info("Add a note for your shipment request")
      return
    }
    if (!packaging) {
      toast.error("Select a packaging option")
      return
    }
    await onSubmit(packaging, customerNote.trim())
  }

  return (
    <div className="portal-request-mail__dialog-backdrop" role="presentation">
      <div
        className="portal-request-mail__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-mail-dialog-title"
      >
        <div className="portal-request-mail__dialog-head">
          <h2 id="request-mail-dialog-title" className="portal-request-mail__dialog-title">
            {step === "policy" ? "Before you ship" : "Packaging and notes"}
          </h2>
          <button
            type="button"
            className="portal-request-mail__dialog-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        <div className="portal-request-mail__dialog-body">
          {step === "policy" ? (
            <article className="portal-request-mail__policy">
              <p>
                Please review these points before we process your shipment. By continuing,
                you confirm the contents and accept our warehouse packing rules.
              </p>
              <ul>
                <li>
                  Warehouse hours are Monday to Saturday, 8:30 to 17:30. Sundays and
                  public holidays are closed.
                </li>
                <li>
                  Packing is done in order of request. It usually takes 1 to 3 working
                  days after you apply.
                </li>
                <li>
                  Confirm prohibited or restricted items before shipping. Losses from
                  customs or security seizure are not covered.
                </li>
                <li>
                  Billing weight uses packed weight. Courier packaging may be removed
                  unless you note otherwise.
                </li>
                <li>
                  Free storage is 90 days. After that, storage fees may apply and
                  parcels over 180 days may be destroyed.
                </li>
                <li>
                  Transit damage is not covered. Use extra protection for fragile goods.
                </li>
                <li>
                  Report issues within 7 days of delivery. Delays from force majeure
                  are not guaranteed against.
                </li>
              </ul>
              <p className="portal-request-mail__policy-aside">
                If you are unsure about an item, contact support before submitting this
                request.
              </p>
            </article>
          ) : (
            <>
              <p className="portal-request-mail__dialog-intro">
                Choose how we should pack your goods. Final weight may change after
                packaging.
              </p>

              <div className="portal-request-mail__packaging-chips">
                {PACKAGING_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`portal-request-mail__chip${packaging === option ? " is-active" : ""}`}
                    onClick={() => setPackaging(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <PortalFormField
                label="Shipment note"
                hint="Special instructions for the warehouse team"
              >
                <PortalFormTextarea
                  name="customer_note"
                  placeholder="Fragile items, keep shoe boxes, etc."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  rows={4}
                />
              </PortalFormField>
            </>
          )}
        </div>

        <div className="portal-request-mail__dialog-actions">
          {step === "policy" ? (
            <>
              <button
                type="button"
                className="portal-account__btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="portal-packages__btn-primary"
                onClick={() => setStep("confirm")}
                disabled={submitting}
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="portal-account__btn-secondary"
                onClick={() => setStep("policy")}
                disabled={submitting}
              >
                Back
              </button>
              <button
                type="button"
                className="portal-packages__btn-primary"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? (
                  <DHEIRLoader color="#fff" size={8} />
                ) : (
                  "Submit request"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
