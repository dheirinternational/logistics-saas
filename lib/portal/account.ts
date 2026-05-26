import { pool } from "@/lib/db/db"
import type { Address } from "@/types/entityTypeDef"

export type PortalAccountData = {
  firstName: string
  lastName: string
  memberCode: string
  profileImg: string | null
  email: string
  address: Pick<
    Address,
    "country" | "state" | "city" | "street" | "postal_code"
  > | null
}

export async function getPortalAccountData(
  userId: number,
): Promise<PortalAccountData> {
  const [userRes, addressRes] = await Promise.all([
    pool.query(
      `
      SELECT u.first_name, u.last_name, u.email, u.profile_img, c.code
      FROM users u
      JOIN customers c ON u.id = c.user_id
      WHERE u.id = $1
      `,
      [userId],
    ),
    pool.query(
      `
      SELECT country, state, city, street, postal_code
      FROM addresses
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId],
    ),
  ])

  const user = userRes.rows[0]
  const address = addressRes.rows[0] as PortalAccountData["address"] | undefined

  return {
    firstName: user?.first_name?.trim() ?? "",
    lastName: user?.last_name?.trim() ?? "",
    memberCode: user?.code ?? "",
    profileImg: user?.profile_img ?? null,
    email: user?.email ?? "",
    address: address ?? null,
  }
}

export function formatAccountAddress(
  address: PortalAccountData["address"],
): string {
  if (!address) return "No delivery address on file"
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean)
  return parts.join(", ") || "No delivery address on file"
}
