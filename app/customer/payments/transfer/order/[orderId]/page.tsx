import { PortalBankTransferPage } from "@/components/portal/payments/PortalBankTransferPage"

export default async function OrderBankTransferPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  return (
    <PortalBankTransferPage
      paymentType="order"
      reference={orderId}
      backHref="/customer/marketplace/cart"
      backLabel="Cart"
      successRedirect="/customer/orders"
    />
  )
}
