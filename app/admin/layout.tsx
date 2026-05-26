import { Header } from "@/components/admin/Header";
import { SideBar } from "@/components/admin/side_bar/SideBar";
import { getSession } from "@/lib/db/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function AdminLayout({children}: {children: ReactNode}){
    
    const session = await getSession()

    if(!session || session.role !== "admin"){
        redirect("/auth/login")
    }
    
    return (
        <div className="admin-shell">
            <SideBar />
            <div className="admin-shell__content">
                <Header />
                <main className="admin-shell__main">{children}</main>
            </div>
        </div>
    )
}