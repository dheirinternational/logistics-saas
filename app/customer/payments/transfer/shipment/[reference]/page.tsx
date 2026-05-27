import { PortalBankTransferPage } from "@/components/portal/payments/PortalBankTransferPage"

export default async function ShipmentBankTransferPage({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  const { reference } = await params

  return (
    <PortalBankTransferPage
      paymentType="shipment"
      reference={reference}
      backHref="/customer/pending_payments"
      backLabel="Pending payments"
      successRedirect="/customer/pending_payments"
    />
  )
}
