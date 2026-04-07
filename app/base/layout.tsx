import NavBar from "@/components/base/NavBar";
import { getSession } from "@/lib/db/session";
import { handleRedirect } from "@/lib/redirect/handleRedirect";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function HomeLayout ({children} :{children: ReactNode}){
    
    const session = await getSession()

    if(!session){
        redirect("/auth/login")
    }
    if(session.role !== "customer"){
        handleRedirect(session.role)
    }
    
    return(
        <div className="min-h-dvh h-dvh">
            {children}
            <NavBar/>
        </div>
    )
}