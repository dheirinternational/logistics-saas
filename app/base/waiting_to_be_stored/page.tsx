import { redirect } from "next/navigation"

export default function WaitingToBeStoredRedirect() {
  redirect("/base/packages?tab=incoming")
}
