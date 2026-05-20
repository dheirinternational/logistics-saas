import { handleRedirect } from "@/lib/redirect/handleRedirect"
import { getSession } from "@/lib/db/session"
import { redirect } from "next/navigation"

export default async function Home() {

  const session = await getSession()
  
  console.log(session)

  if (!session) {
    redirect("/auth/login")
  }

  if (session.role === "customer"){
      redirect("/base")
  }
  else if (session.role === "admin"){
      redirect("/admin")
  }
  else {
      redirect("/auth/login")
  }
}
