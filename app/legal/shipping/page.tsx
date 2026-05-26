import { LegalDocument } from "@/components/marketing/LegalDocument"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & Delivery | DHEIR International",
  description: "Shipping, logistics, and delivery conditions for DHEIR International.",
}

const SHIPPING_TEXT = String.raw`4 Shipping, Logistics & Delivery
4.1 Shipping Routes
D_HEIR International procures goods from suppliers in China. Goods are shipped via sea freight or air
freight, before onward dispatch to Africa. Delivery is currently available to:
• Nigeria — primary market (Lagos, Abuja, Port Harcourt, and nationwide via courier partners)
• Other African countries — Ghana, Kenya, South Africa, Cameroon, Uganda, Senegal, and other
African nations by arrangement
4.2 Estimated Delivery Times
Item Policy
Sea freight (China to Nigeria) Approximately 3–4 months from order confirmation date
Air freight (China to Nigeria) Approximately 2–4 weeks (subject to availability and order type)
Delivery to other African
countries
Timeline communicated on a per-order basis
Last-mile delivery within
Nigeria
3–10 business days after customs clearance
Shipping Time Disclaimer
All delivery timelines are estimates only. D_HEIR International has limited control over actual
shipping schedules, port congestion, customs processing times, and the internal schedules of
freight carriers. Delays caused by any of these factors do not entitle the customer to a refund or
cancellation.
4.3 Shipping & Waybill Fees
• Shipping and waybill costs are not included in the product price and are charged separately.
• Customers will be notified of their applicable shipping fee before or upon arrival of goods in Nigeria.
• Shipping fees must be paid within seven (7) calendar days of notification. Failure to pay within this
period will result in the following:
◦ D_HEIR International reserves the right to put the customer's item up for resale to recover the
unpaid shipping fee.
◦ No refund will be issued to the customer in this scenario.
• For customers in other African countries, shipping fees to the destination country will be
communicated separately and are the full responsibility of the customer.
4.4 Customs Clearance
• D_HEIR International provides customs clearance assistance for goods entering Nigeria.
• Import duties, customs levies, and associated government charges applicable in Nigeria are
factored into the overall cost communicated to the customer.
• For customers in other African countries, customs duties and clearance in the destination country
are entirely the customer's responsibility. D_HEIR International will provide all necessary shipping
documents to facilitate clearance.
• Any delays caused by customs authorities in any country are outside D_HEIR International's
control and do not entitle the customer to a refund or compensation.
4.5 Customer Delivery Responsibilities
• Customers must provide accurate and complete delivery information including: full name, delivery
address, nearest landmark, and active phone number.
• Any delivery failure or re-delivery costs resulting from incorrect or incomplete delivery information
provided by the customer are the customer's sole responsibility.
• Customers must follow up on shipping fee notifications and respond within the 7-day window.
D_HEIR International is not responsible for goods that are resold due to non-payment of shipping
fees.
• Customers in pre-order groups must monitor group communications for updates, shipping
notifications, and fee requests.`

export default function ShippingTermsPage() {
  return (
    <LegalDocument
      title="Shipping & Delivery"
      subtitle="Shipping, logistics and delivery conditions"
      text={SHIPPING_TEXT}
    />
  )
}
