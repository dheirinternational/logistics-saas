import type { Metadata } from "next"
import { LegalDocument } from "@/components/marketing/LegalDocument"

export const metadata: Metadata = {
  title: "Refunds & Cancellations | DHEIR International",
  description: "Refund and cancellation rules for DHEIR International.",
}

const REFUNDS_TEXT = String.raw`5 Refund Policy
Core Refund Position — No Refunds After Payment
D_HEIR International operates a strict no-refund policy once payment for a product has been
received and the order has been confirmed. This is because payment is immediately converted
to RMB and remitted to the supplier upon receipt. The procurement process begins instantly and
cannot be reversed. By making payment, the customer accepts this policy unconditionally.
5.1 No Refund — Standard Rule
• Once full payment is made and an order is confirmed, no refund will be issued under any
circumstances, including but not limited to: change of mind, personal preference, or the customer
finding a lower price elsewhere.
• No refunds will be issued for products that are in transit, have already been shipped, or have
already been paid to the supplier.
• No refund will be issued for minor product variations (see Section 3 — Product Images &
Descriptions).
5.2 Limited Exception — Pre-Supplier Payment Window
A refund may only be considered under the following narrow condition:
• The customer requests a cancellation promptly after placing the order, AND
• D_HEIR International has not yet remitted payment to the supplier at the time of the cancellation
request.
If both conditions above are met, the following applies:
• The RMB equivalent of the payment must first be sold back to convert to NGN before a refund can
be processed. This takes time and the customer must wait for this conversion.
• Due to exchange rate fluctuations, the refund amount in NGN may be less than the original amount
paid. Any such shortfall is borne entirely by the customer.
• Alternatively, the customer may elect to retain the funds as company credit toward a future order,
avoiding any exchange rate loss.
5.3 Out-of-Stock Situations
• If a confirmed product becomes out of stock after full payment, the customer will be offered
company credit or the option to wait for restocking.
• A cash refund for an out-of-stock item will only be considered if D_HEIR International cannot
provide any reasonable alternative within a stated period, and will be subject to the same currency
reconversion process and conditions in Section 5.2 above.
5.4 Company Credit
• Company credit is valid for 12 months from the date of issuance.
• Credit can be applied to any available product on our platforms.
• Company credit is non-transferable and holds no cash value.

7 Cancellation Policy
7.1 Cancellations Before Payment
• Customers may withdraw from an intended order at any time before payment is made with no
penalty or obligation.
7.2 Cancellations After Payment — General Rule
No Cancellations After Confirmed Payment
Once payment is received and the order is confirmed, cancellation is not permitted. The
procurement process begins immediately upon payment. D_HEIR International is contractually
committed to the supplier at that point.
7.3 Limited Cancellation Window
In exceptional circumstances, a cancellation request may be reviewed by D_HEIR International
management if:
• The request is made within 12 hours of payment confirmation, AND
• The supplier has not yet been paid by D_HEIR International at the time of the request.
If approved, the cancellation will be subject to the refund terms outlined in Section 5.2, including currency
reconversion risk and potential shortfall in NGN refund amount.
7.4 No Cancellations — Circumstances
No cancellation will be accepted under any of the following conditions:
• The order has already been paid to the supplier
• The goods are in production at the factory
• The goods are in transit (sea or air)
• The goods have arrived in Nigeria or the destination country
• The customer simply changed their mind, found a better price, or no longer needs the product`

export default function RefundsPage() {
  return (
    <LegalDocument
      title="Refunds & Cancellations"
      subtitle="Refund policy and cancellation rules"
      text={REFUNDS_TEXT}
    />
  )
}
