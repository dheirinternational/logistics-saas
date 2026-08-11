import { PortalBankTransferPage } from "@/components/portal/payments/PortalBankTransferPage"

export default async function ProcurementBankTransferPage({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  const { reference } = await params

  return (
    <PortalBankTransferPage
      paymentType="procurement_commitment"
      reference={reference}
      backHref="/customer/procurement"
      backLabel="Procurement Hub"
      successRedirect="/customer/procurement"
    />
  )
}
