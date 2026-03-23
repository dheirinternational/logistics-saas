import { Header } from "@/components/Header";
import { ReactNode } from "react";

export default function AdminLayout({children}: {children: ReactNode}){
    return(
        <div className="max-h-dvh h-dvh">
            <Header />
            {children}
        </div>
    )
}