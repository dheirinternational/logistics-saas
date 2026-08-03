"use client"

import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { formatPaymentAmount, formatPaymentDate } from "@/lib/portal/paymentDisplay"
import type { ManualPaymentSubmissionWithCustomer } from "@/lib/manualPayments/types"
import {
  IconBuildingBank,
  IconCircleCheck,
  IconClock,
  IconEye,
  IconX,
} from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/ui/toast"

export function AdminPaymentConfirmationsPage() {
  const [submissions, setSubmissions] = useState<ManualPaymentSubmissionWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ManualPaymentSubmissionWithCustomer | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [loadingReceipt, setLoadingReceipt] = useState(false)
  const [adminNote, setAdminNote] = useState("")
  const [reviewing, setReviewing] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)

  const fetchSubmissions = useCallback(async (pageToLoad: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/manual-payments/admin?status=awaiting_confirmation&page=${pageToLoad}&pageSize=${pageSize}`,
        {
        credentials: "include",
        }
      )
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message ?? "Could not load payment confirmations")
        setSubmissions([])
        setTotal(0)
        return
      }

      setSubmissions(result.data ?? [])
      setTotal(Number(result.pagination?.total ?? 0))
      setPage(Number(result.pagination?.page ?? pageToLoad))
    } catch {
      toast.error("Could not load payment confirmations")
      setSubmissions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    fetchSubmissions(1)
  }, [fetchSubmissions])

  const openSubmission = async (submission: ManualPaymentSubmissionWithCustomer) => {
    setSelected(submission)
    setAdminNote("")
    setReceiptUrl(null)
    setLoadingReceipt(true)

    try {
      const res = await fetch(`/api/manual-payments/admin/${submission.id}`, {
        credentials: "include",
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message ?? "Could not load receipt")
        return
      }

      setReceiptUrl(result.data?.url ?? null)
    } catch {
      toast.error("Could not load receipt")
    } finally {
      setLoadingReceipt(false)
    }
  }

  const reviewSubmission = async (action: "confirm" | "reject") => {
    if (!selected) return

    if (action === "reject" && !adminNote.trim()) {
      toast.error("Add a reason when rejecting a transfer proof")
      return
    }

    setReviewing(true)
    try {
      const res = await fetch(`/api/manual-payments/admin/${selected.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, admin_note: adminNote }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message ?? "Could not review submission")
        return
      }

      toast.success(result.message ?? "Updated")
      setSelected(null)
      setReceiptUrl(null)
      fetchSubmissions(page)
    } catch {
      toast.error("Could not review submission")
    } finally {
      setReviewing(false)
    }
  }

  const totalDue = useMemo(
    () => submissions.reduce((sum, item) => sum + Number(item.amount), 0),
    [submissions]
  )

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const customerName = (item: ManualPaymentSubmissionWithCustomer) =>
    `${item.customer_first_name ?? ""} ${item.customer_last_name ?? ""}`.trim() ||
    item.customer_email

  return (
    <>
      <div className="portal-home admin-payment-confirmations">
        <header className="portal-home__greeting">
          <div>
            <p className="portal-home__greeting-label">Admin</p>
            <h1 className="portal-home__greeting-title">Payment confirmations</h1>
            <p className="portal-home__greeting-sub">
              Verify bank transfers quickly so customers can receive shipments and orders.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="portal-home__panel portal-home__loader">
            <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : (
          <>
            <div className="portal-home__stats portal-home__stats--three" role="list">
              <div className="portal-home__stat-card" role="listitem">
                <span className="portal-home__stat-card-icon" aria-hidden>
                  <IconClock size={22} stroke={1.5} />
                </span>
                <span className="portal-home__stat-card-body">
                  <span className="portal-home__stat-card-label">Awaiting</span>
                  <span className="portal-home__stat-card-value">{submissions.length}</span>
                  <span className="portal-home__stat-card-hint">Needs review</span>
                </span>
              </div>

              <div className="portal-home__stat-card" role="listitem">
                <span className="portal-home__stat-card-icon" aria-hidden>
                  <IconBuildingBank size={22} stroke={1.5} />
                </span>
                <span className="portal-home__stat-card-body">
                  <span className="portal-home__stat-card-label">Total value</span>
                  <span className="portal-home__stat-card-value tabular-nums">
                    {formatPaymentAmount(totalDue)}
                  </span>
                  <span className="portal-home__stat-card-hint">Open queue</span>
                </span>
              </div>

              <div className="portal-home__stat-card" role="listitem">
                <span className="portal-home__stat-card-icon" aria-hidden>
                  <IconCircleCheck size={22} stroke={1.5} />
                </span>
                <span className="portal-home__stat-card-body">
                  <span className="portal-home__stat-card-label">Action</span>
                  <span className="portal-home__stat-card-value">Confirm</span>
                  <span className="portal-home__stat-card-hint">Only after bank receipt</span>
                </span>
              </div>
            </div>

            <section
              className="admin-payment-confirmations__queue"
              aria-labelledby="confirmations-heading"
            >
              <div className="portal-home__panel-head admin-payment-confirmations__queue-head">
                <div>
                  <h2 id="confirmations-heading" className="portal-home__section-title">
                    Transfer queue
                  </h2>
                  <p className="portal-home__section-sub">
                    Oldest submissions first. Confirm only when the transfer is in your bank account.
                  </p>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="portal-home__panel-empty admin-payment-confirmations__queue-empty">
                  <p className="portal-home__empty">No transfers awaiting confirmation.</p>
                </div>
              ) : (
                <>
                  <ul className="portal-payments__list">
                    {submissions.map((item) => (
                      <li key={item.id}>
                        <article className="admin-payment-confirmation__row">
                        <div className="portal-payments__card-head">
                          <div>
                            <p className="portal-payments__tracking portal-payments__tracking--title">
                              {item.payment_type === "shipment" ? "Shipment" : "Order"} ·{" "}
                              {item.reference}
                            </p>
                            <p className="portal-payments__ref portal-payments__ref--sub">
                              {customerName(item)} · {item.customer_code || "-"}
                            </p>
                          </div>
                          <span className="portal-payments__status portal-payments__status--awaiting">
                            Awaiting
                          </span>
                        </div>

                        <dl className="portal-payments__meta">
                          <div>
                            <dt>Amount</dt>
                            <dd className="portal-payments__amount tabular-nums">
                              {formatPaymentAmount(Number(item.amount))}
                            </dd>
                          </div>
                          <div>
                            <dt>Submitted</dt>
                            <dd>
                              <time dateTime={item.created_at}>
                                {formatPaymentDate(item.created_at)}
                              </time>
                            </dd>
                          </div>
                          {item.transfer_reference ? (
                            <div className="portal-payments__meta-wide">
                              <dt>Customer bank ref</dt>
                              <dd>{item.transfer_reference}</dd>
                            </div>
                          ) : null}
                        </dl>

                        <div className="portal-payments__card-actions">
                          <button
                            type="button"
                            className="portal-home__table-btn"
                            onClick={() => openSubmission(item)}
                          >
                            <IconEye size={16} stroke={1.5} aria-hidden />
                            Review
                          </button>
                        </div>
                      </article>
                      </li>
                    ))}
                  </ul>

                  <div
                    className="portal-home__table-pagination"
                    role="navigation"
                    aria-label="Payment confirmations pages"
                  >
                    <span className="portal-home__table-pagination-text tabular-nums">
                      <strong className="portal-home__table-pagination-total">
                        {total.toLocaleString()} {total === 1 ? "submission" : "submissions"} total
                      </strong>
                      {total > 0 ? (
                        <>
                          {" "}
                          · Showing {(page - 1) * pageSize + 1}–
                          {Math.min(page * pageSize, total)}
                        </>
                      ) : null}
                      {" "}
                      · Page {page} of {totalPages}
                    </span>
                    <div className="portal-home__table-pagination-actions">
                      <button
                        type="button"
                        className="portal-home__table-btn"
                        disabled={loading || page <= 1}
                        onClick={() => fetchSubmissions(page - 1)}
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        className="portal-home__table-btn"
                        disabled={loading || page >= totalPages}
                        onClick={() => fetchSubmissions(page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>

      {selected ? (
        <div
          className="dheir-dialog-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !reviewing) {
              setSelected(null)
              setReceiptUrl(null)
            }
          }}
        >
          <div
            className="dheir-dialog admin-modal admin-payment-review"
            role="dialog"
            aria-modal="true"
            aria-label="Review transfer proof"
          >
            <div className="dheir-dialog__head">
              <div>
                <h2 className="dheir-dialog__title">Review transfer proof</h2>
                <p className="admin-modal__subtitle">
                  {selected.payment_type === "shipment" ? "Shipment" : "Order"} ·{" "}
                  {selected.reference}
                </p>
              </div>
              <button
                type="button"
                className="dheir-dialog__close"
                onClick={() => {
                  if (!reviewing) {
                    setSelected(null)
                    setReceiptUrl(null)
                  }
                }}
                aria-label="Close"
              >
                <IconX size={20} stroke={1.5} />
              </button>
            </div>

            <div className="admin-modal__body">
              <div className="admin-modal__form">
                <div className="admin-modal__fields">
                  <div className="portal-packages__field">
                    <span className="portal-packages__field-label">Customer</span>
                    <p className="admin-shipment-view__value">{customerName(selected)}</p>
                  </div>
                  <div className="portal-packages__field">
                    <span className="portal-packages__field-label">Amount expected</span>
                    <p className="admin-shipment-view__value tabular-nums">
                      {formatPaymentAmount(Number(selected.amount))}
                    </p>
                  </div>
                  <div className="portal-packages__field">
                    <span className="portal-packages__field-label">Submitted</span>
                    <p className="admin-shipment-view__value">
                      {formatPaymentDate(selected.created_at)}
                    </p>
                  </div>
                  {selected.transfer_reference ? (
                    <div className="portal-packages__field">
                      <span className="portal-packages__field-label">Customer bank ref</span>
                      <p className="admin-shipment-view__value">{selected.transfer_reference}</p>
                    </div>
                  ) : null}
                  {selected.customer_note ? (
                    <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                      <span className="portal-packages__field-label">Customer note</span>
                      <p className="admin-shipment-view__note">{selected.customer_note}</p>
                    </div>
                  ) : null}
                </div>

                <div className="admin-uploader admin-payment-review__receipt">
                  <p className="portal-packages__field-label">Receipt</p>
                  {loadingReceipt ? (
                    <div className="portal-home__loader">
                      <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
                    </div>
                  ) : receiptUrl ? (
                    selected.receipt_mime_type === "application/pdf" ? (
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="portal-home__table-link"
                      >
                        Open PDF receipt
                      </a>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={receiptUrl}
                        alt="Transfer receipt"
                        className="admin-payment-review__receipt-image"
                      />
                    )
                  ) : (
                    <p className="admin-uploader__help">Receipt unavailable</p>
                  )}
                </div>

                <label className="portal-packages__field" htmlFor="admin-note">
                  <span className="portal-packages__field-label">
                    Admin note {selected ? "(required if rejecting)" : ""}
                  </span>
                  <textarea
                    id="admin-note"
                    className="portal-payments__input admin-payment-review__note"
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Reason for rejection or internal note"
                  />
                </label>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    className="portal-home__btn portal-home__btn--secondary"
                    disabled={reviewing}
                    onClick={() => reviewSubmission("reject")}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="portal-home__btn portal-home__btn--primary"
                    disabled={reviewing}
                    onClick={() => reviewSubmission("confirm")}
                  >
                    {reviewing ? (
                      <DHEIRLoader color="#fff" size={8} />
                    ) : (
                      "Confirm received"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
