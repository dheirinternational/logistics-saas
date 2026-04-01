import { Header } from "@/components/admin/Header";
import { getSession } from "@/lib/db/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";

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