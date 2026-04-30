import { Header } from "@/components/admin/Header";
import { SideBar } from "@/components/admin/side_bar/SideBar";
import { getSession } from "@/lib/db/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({children}: {children: ReactNode}){
    
    const session = await getSession()

    if(!session || session.role !== "admin"){
        redirect("/auth/login")
    }
    
    return(
        <div className="max-h-dvh h-dvh flex">
            <SideBar />
            <div className="w-[calc(100vw-200px)] h-dvh overflow-y-auto">
                <Header />
                <div className="h-dvh max-h-dvh max-sm:h-[calc(100dvh-56px)] max-sm:max-h-[calc(100dvh-56px)] bg-gray-100">
                    {children}
                </div>
            </div>
        </div>
    )
}