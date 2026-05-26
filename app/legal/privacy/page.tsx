import { LegalDocument } from "@/components/marketing/LegalDocument"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | DHEIR International",
  description: "Privacy Policy for DHEIR International.",
}

const PRIVACY_TEXT = String.raw`Preamble & Scope
D_HEIR International is a procurement and Logistics company specialising in sourcing and importing
goods from China, For delivery to customers across Nigeria and other African countries. We are not
manufacturers or producers of any goods we list or promote on our platforms.
This Customer Procurement & Logistics Policy sets out the rules, obligations, and expectations governing
every transaction between D_HEIR International and its customers. It covers the full order lifecycle — from
enquiry and payment through to shipping, delivery, and post-delivery matters.
By placing an order with D_HEIR International through any of our platforms — including our website,
Instagram, WhatsApp, Telegram, or any other channel — customers confirm that they have read,
understood, and accepted this policy in its entirety.
Who This Policy Applies To
This policy applies to all D_HEIR International customers, including customers based in Nigeria
(our primary market) and customers located in other African countries including but not limited to
Ghana, Kenya, South Africa, Cameroon, Senegal, Uganda, and other African Union member
states. Where local regulations in a customer's country impose additional obligations, those
obligations are the responsibility of the customer.

8 Customer Obligations
Every customer engaging with D_HEIR International agrees to the following obligations:
8.1 Accurate Information
• Provide accurate, complete, and up-to-date delivery addresses, phone numbers, and contact
details at the time of order placement.
• Any costs, delays, or losses arising from incorrect information provided by the customer are the
customer's sole responsibility.
8.2 Order Monitoring
• Customers in pre-order groups must actively monitor the group for all updates, announcements,
shipping fee notifications, and delivery information.
• D_HEIR International is not responsible for missed communications where the customer has
access to the relevant channel but fails to read or respond.
8.3 Shipping Fee Payment
• Shipping fees must be paid within seven (7) calendar days of notification. No extensions will be
granted except by written approval from D_HEIR International management.
• Non-payment within the deadline will result in the customer's item being resold with no refund
issued.
8.4 Compliance with Destination Country Laws
• Customers in Nigeria and other African countries are responsible for ensuring that the products
they order are legal to import and possess in their country of residence.
• D_HEIR International will not be held responsible for goods seized, confiscated, or returned by
customs authorities due to the customer ordering restricted or prohibited items.

9 Dispute Resolution
9.1 Internal Resolution
• In the first instance, all disputes must be raised directly with D_HEIR International via our official
communication channels (WhatsApp, email, or Telegram).
• D_HEIR International will acknowledge all dispute notices within 2 business days and aim to
provide a resolution or substantive response within 7 business days.
9.2 Governing Law
• This policy and any disputes arising from it are governed by the laws of the Federal Republic of
Nigeria.
• Both parties agree to submit to the jurisdiction of Nigerian courts for the resolution of any dispute
that cannot be resolved amicably.
• For customers outside Nigeria, this policy still applies in its entirety. Any legal proceedings will be
conducted in Nigeria unless otherwise agreed in writing.
9.3 Policy Amendments
• D_HEIR International reserves the right to update or amend this policy at any time.
• Customers will be notified of material changes via our platforms.
• Continued engagement with D_HEIR International after a policy update constitutes acceptance of
the revised terms.`

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      subtitle="Policy text extracted from Customer Procurement & Logistics Policy (verbatim excerpts)"
      text={PRIVACY_TEXT}
    />
  )
}
