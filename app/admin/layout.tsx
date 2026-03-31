import { Header } from "@/components/admin/Header";
import { getSession } from "@/lib/db/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({children}: {children: ReactNode}){
    
    const session = await getSession()

    if(!session || session.role !== "admin"){
        redirect("/auth/login")
    }
    
    return(
        <div className="max-h-dvh h-dvh">
            <Header />
            {children}
        </div>
    )
}