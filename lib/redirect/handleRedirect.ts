import { redirect } from "next/navigation"

export const handleRedirect = (role: string | null) => {

    if (role === "customer"){
        redirect("/base")
    }
    else if (role === "admin"){
        redirect("/admin")
    }
    else {
        redirect("/auth/login")
    }


}