import { ReactNode } from "react";

export default function PageLayout({children}: {children: ReactNode}){
    return <div className="h-screen w-full">
        {children}
    </div>
}