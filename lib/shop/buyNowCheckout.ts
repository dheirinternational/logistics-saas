import { toast } from "@/lib/ui/toast"
import { useCartStore } from "@/store/cartStore"
import type { CartProduct } from "@/types/entityTypeDef"

export const SHOP_BUY_NOW_CHECKOUT_PATH = "/customer/payments/transfer/order/new"

export async function startShopBuyNowCheckout(item: CartProduct): Promise<boolean> {
  if (item.amount_to_be_ordered < 1 || item.quantity < 1) {
    toast.error("This product is out of stock")
    return false
  }

  try {
    const [bankRes, userRes, addressRes] = await Promise.all([
      fetch("/api/bank-transfer/config", { credentials: "include" }),
      fetch("/api/users/my-data", { credentials: "include" }),
      fetch("/api/addresses/user", { credentials: "include" }),
    ])

    if (!bankRes.ok) {
      toast.error("Bank transfer checkout is unavailable right now")
      return false
    }

    const userJson = await userRes.json()
    if (!userRes.ok || !userJson?.data?.email || !userJson?.data?.code) {
      toast.error("Account details are still loading")
      return false
    }

    const addressJson = await addressRes.json()
    const addr = addressJson?.data?.[0]
    if (!addressRes.ok || !addr) {
      toast.error("Add your delivery address first")
      return false
    }
  } catch {
    toast.error("Could not start checkout")
    return false
  }

  const { clearCart, addProduct } = useCartStore.getState()
  clearCart()
  addProduct(item)

  return true
}
