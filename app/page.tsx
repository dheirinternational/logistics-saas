import { handleRedirect } from "@/lib/redirect/handleRedirect"
import { getSession } from "@/lib/db/session"

export default async function Home() {

  const session = await getSession()
  
  console.log(session)

  if (!session) {
    handleRedirect(null)
    return null
  }

  handleRedirect(session.role)

  return null
}
